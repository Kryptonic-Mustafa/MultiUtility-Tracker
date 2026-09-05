from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from datetime import datetime, date

from backend.app.core.db import get_db_sync
from backend.app.models.db_models import AttendanceLogModel, UserModel

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

class MarkAttendanceRequest(BaseModel):
    user_id: str
    status: str # "PRESENT", "ABSENT", "NOT_LOGGED_IN"
    date_str: Optional[str] = None # "YYYY-MM-DD"
    marked_by: Optional[str] = None # "Teacher (TCH-201)"

@router.get("/logs")
def get_attendance_logs(
    role: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    limit: int = Query(500, le=2000),
    db: Session = Depends(get_db_sync)
):
    query = db.query(AttendanceLogModel, UserModel.name, UserModel.profile_image_url).outerjoin(
        UserModel, AttendanceLogModel.user_id == UserModel.user_id
    ).order_by(AttendanceLogModel.timestamp.desc())

    if role:
        query = query.filter(AttendanceLogModel.user_role == role.upper())
    if user_id:
        query = query.filter(AttendanceLogModel.user_id == user_id)

    rows = query.limit(limit).all()

    logs = []
    for log, name, img_url in rows:
        logs.append({
            "id": log.id,
            "user_id": log.user_id,
            "name": name or log.user_id,
            "user_role": log.user_role,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "entry_type": log.entry_type,
            "confidence_score": log.confidence_score,
            "device_info": log.device_info,
            "profile_image_url": img_url
        })
    return logs

@router.post("/mark")
def mark_attendance(
    req: MarkAttendanceRequest,
    db: Session = Depends(get_db_sync)
):
    user = db.query(UserModel).filter(UserModel.user_id == req.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    target_date = datetime.utcnow().date()
    if req.date_str:
        try:
            target_date = datetime.strptime(req.date_str, "%Y-%m-%d").date()
        except ValueError:
            pass

    start_dt = datetime.combine(target_date, datetime.min.time())
    end_dt = datetime.combine(target_date, datetime.max.time())

    existing_logs = db.query(AttendanceLogModel).filter(
        AttendanceLogModel.user_id == req.user_id,
        AttendanceLogModel.timestamp >= start_dt,
        AttendanceLogModel.timestamp <= end_dt
    ).all()

    if req.status == "NOT_LOGGED_IN":
        for l in existing_logs:
            db.delete(l)
        db.commit()
        return {"status": "success", "message": f"Attendance reset for {req.user_id}"}

    entry_type = "IN" if req.status == "PRESENT" else "ABSENT"
    device_info = f"Manual ({req.marked_by or 'Teacher'})"

    if existing_logs:
        log = existing_logs[0]
        log.entry_type = entry_type
        log.device_info = device_info
        log.timestamp = datetime.combine(target_date, datetime.utcnow().time())
        for extra in existing_logs[1:]:
            db.delete(extra)
    else:
        log = AttendanceLogModel(
            user_id=req.user_id,
            user_role=user.role,
            timestamp=datetime.combine(target_date, datetime.utcnow().time()),
            entry_type=entry_type,
            confidence_score=1.0,
            device_info=device_info
        )
        db.add(log)

    db.commit()
    return {"status": "success", "message": f"Attendance marked as {req.status} for {req.user_id}"}
