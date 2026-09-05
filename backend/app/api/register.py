import json
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.app.core.db import get_db_sync
from backend.app.core.face_engine import face_engine
from backend.app.models.db_models import UserModel, StudentDetailModel, FacultyDetailModel

router = APIRouter(prefix="/api/register", tags=["Register"])

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

class RegisterUserRequest(BaseModel):
    user_id: str
    name: str
    role: str # STUDENT, HOD, TEACHER, SUB_TEACHER, STAFF
    email: str = ""
    phone: str = ""
    dept_id: str = ""
    image_base64: str
    subjects_csv: str = ""
    tags_csv: str = ""
    # Student specific
    roll_number: str = ""
    academic_year: int = 1
    section: str = "A"
    guardian_name: str = ""
    guardian_contact: str = ""
    # Faculty specific
    designation: str = "Faculty"
    specialization: str = ""
    shift_start: str = "09:00:00"
    shift_end: str = "17:00:00"

@router.post("/user")
def register_user(req: RegisterUserRequest, db: Session = Depends(get_db_sync)):
    existing = db.query(UserModel).filter(UserModel.user_id == req.user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User ID '{req.user_id}' already exists.")

    bgr_img = face_engine.decode_image_base64(req.image_base64)
    if bgr_img is None:
        raise HTTPException(status_code=400, detail="Invalid image data provided.")

    encoding, bbox = face_engine.extract_encoding(bgr_img)
    if encoding is None:
        raise HTTPException(
            status_code=400,
            detail="No face detected in image. Please take a clear face photo."
        )

    # Clean direct bcrypt hashing
    hashed_pwd = hash_password("password")

    new_user = UserModel(
        user_id=req.user_id.strip(),
        name=req.name.strip(),
        email=req.email.strip(),
        password_hash=hashed_pwd,
        role=req.role.strip().upper(),
        dept_id=req.dept_id.strip(),
        assigned_modules_csv="SMS",
        subjects_csv=req.subjects_csv.strip(),
        tags_csv=req.tags_csv.strip(),
        face_encoding=json.dumps(encoding),
        profile_image_url=req.image_base64,
        is_active=1
    )
    db.add(new_user)
    db.flush()

    if req.role.upper() == "STUDENT":
        roll_no = req.roll_number.strip() or req.user_id.strip()
        stu_detail = StudentDetailModel(
            user_id=req.user_id.strip(),
            roll_number=roll_no,
            academic_year=req.academic_year,
            section=req.section.strip(),
            guardian_name=req.guardian_name.strip(),
            guardian_contact=req.guardian_contact.strip()
        )
        db.add(stu_detail)
    else:
        fac_detail = FacultyDetailModel(
            user_id=req.user_id.strip(),
            designation=req.designation.strip() or req.role,
            specialization=req.specialization.strip(),
            shift_start=req.shift_start,
            shift_end=req.shift_end,
            assigned_classes_csv=req.subjects_csv.strip()
        )
        db.add(fac_detail)

    db.commit()

    # Instantly reload memory cache
    face_engine.reload_encodings(db)

    return {
        "status": "success",
        "message": f"Successfully registered {req.role} {req.name} ({req.user_id})",
        "user_id": req.user_id,
        "bbox": bbox
    }
