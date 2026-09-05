from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.core.db import get_db_sync
from backend.app.models.db_models import UserModel, StudentDetailModel

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("")
def get_all_students(db: Session = Depends(get_db_sync)):
    rows = db.query(UserModel, StudentDetailModel).filter(
        UserModel.role == "STUDENT",
        UserModel.user_id == StudentDetailModel.user_id
    ).all()

    output = []
    for user, detail in rows:
        output.append({
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "phone": getattr(user, 'phone', '') or getattr(detail, 'guardian_contact', ''),
            "dept_id": user.dept_id,
            "roll_number": detail.roll_number,
            "academic_year": detail.academic_year,
            "section": detail.section,
            "guardian_name": detail.guardian_name,
            "guardian_contact": detail.guardian_contact,
            "profile_image_url": user.profile_image_url,
            "created_at": user.created_at.isoformat() if user.created_at else None
        })
    return output

@router.delete("/{user_id}")
def delete_student(user_id: str, db: Session = Depends(get_db_sync)):
    user = db.query(UserModel).filter(UserModel.user_id == user_id, UserModel.role == "STUDENT").first()

    if not user:
        raise HTTPException(status_code=404, detail="Student not found")

    db.delete(user)
    
    detail = db.query(StudentDetailModel).filter(StudentDetailModel.user_id == user_id).first()
    if detail:
        db.delete(detail)

    db.commit()
    return {"status": "success", "message": f"Deleted student {user_id}"}
