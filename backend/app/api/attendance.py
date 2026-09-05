from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.core.db import get_db_sync
from backend.app.models.db_models import AttendanceLogModel, UserModel

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

@router.get("/logs")
def get_attendance_logs(
    role: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    limit: int = Query(50, le=500),
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
