import json
import asyncio
import time
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from datetime import datetime

from backend.app.core.db import SessionLocal
from backend.app.core.face_engine import face_engine
from backend.app.core.pipeline import executor, LatestFrameQueue
from backend.app.models.db_models import AttendanceLogModel

router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger("websocket")

cooldown_tracker = {}
COOLDOWN_SECONDS = 30.0

@router.websocket("/ws/attendance")
async def websocket_attendance(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established for Live Kiosk.")

    if face_engine.encodings_matrix is None or len(face_engine.known_user_ids) == 0:
        db = SessionLocal()
        try:
            face_engine.reload_encodings(db)
        finally:
            db.close()

    frame_queue = LatestFrameQueue()

    async def frame_processor():
        while True:
            frame_data = await frame_queue.get()
            if frame_data is None:
                await asyncio.sleep(0.01)
                continue

            try:
                loop = asyncio.get_event_loop()
                
                bgr_img = await loop.run_in_executor(
                    executor, face_engine.decode_image_base64, frame_data
                )

                if bgr_img is None:
                    continue

                encoding, bbox = await loop.run_in_executor(
                    executor, face_engine.extract_encoding, bgr_img
                )

                if encoding is None:
                    await websocket.send_json({
                        "status": "SEARCHING",
                        "message": "Scanning camera feed..."
                    })
                    continue

                match = await loop.run_in_executor(
                    executor, face_engine.recognize_face, encoding
                )

                if match:
                    user_id = match["user_id"]
                    current_time = time.time()
                    last_logged = cooldown_tracker.get(user_id, 0)
                    
                    is_cooldown = (current_time - last_logged) < COOLDOWN_SECONDS

                    if not is_cooldown:
                        cooldown_tracker[user_id] = current_time
                        
                        db = SessionLocal()
                        try:
                            new_log = AttendanceLogModel(
                                user_id=user_id,
                                user_role=match["role"],
                                confidence_score=match["confidence"],
                                device_info="WebKiosk"
                            )
                            db.add(new_log)
                            db.commit()
                        finally:
                            db.close()

                    await websocket.send_json({
                        "status": "MATCHED",
                        "user": match,
                        "bbox": bbox,
                        "cooldown": is_cooldown,
                        "timestamp": datetime.utcnow().isoformat()
                    })

                else:
                    await websocket.send_json({
                        "status": "UNRECOGNIZED",
                        "message": "User Data Not Found",
                        "bbox": bbox,
                        "snapshot": frame_data
                    })

            except Exception as e:
                logger.error(f"Error in frame processing loop: {e}")
                await asyncio.sleep(0.02)

    processor_task = asyncio.create_task(frame_processor())

    try:
        while True:
            data_str = await websocket.receive_text()
            try:
                data = json.loads(data_str)
                frame_b64 = data.get("frame")
                if frame_b64:
                    await frame_queue.put(frame_b64)
            except Exception as ex:
                pass
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected.")
    finally:
        processor_task.cancel()
