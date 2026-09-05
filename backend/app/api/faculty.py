from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.db import get_db_sync
from backend.app.models.db_models import UserModel, FacultyDetailModel

router = APIRouter(prefix="/api/faculty", tags=["Faculty"])

@router.get("")
def get_all_faculty(db: Session = Depends(get_db_sync)):
    rows = db.query(UserModel, FacultyDetailModel).filter(
        UserModel.role.in_(["HOD", "TEACHER", "SUB_TEACHER", "STAFF"]),
        UserModel.user_id == FacultyDetailModel.user_id
    ).all()

    output = []
    for user, detail in rows:
        output.append({
            "user_id": user.user_id,
            "name": user.name,
            "role": user.role,
            "email": user.email,
            "phone": getattr(user, 'phone', ''),
            "dept_id": user.dept_id,
            "designation": detail.designation,
            "specialization": detail.specialization,
            "shift_start": detail.shift_start,
            "shift_end": detail.shift_end,
            "assigned_classes_csv": detail.assigned_classes_csv,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return output

@router.delete("/{user_id}")
def delete_faculty(user_id: str, db: Session = Depends(get_db_sync)):
    user = db.query(UserModel).filter(UserModel.user_id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="Faculty member not found")

    db.delete(user)
    
    detail = db.query(FacultyDetailModel).filter(FacultyDetailModel.user_id == user_id).first()
    if detail:
        db.delete(detail)

    db.commit()
    return {"status": "success", "message": f"Deleted faculty member {user_id}"}
