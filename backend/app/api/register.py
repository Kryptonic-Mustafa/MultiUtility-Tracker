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
    password: str = "" # Optional custom password
    dept_id: str = ""
    image_base64: str
    subjects_csv: str = ""
    tags_csv: str = ""
    # Student specific
    roll_number: str = ""
    academic_year: int = 1
    section: str = "A"
    parent_name: str = ""
    parent_contact: str = ""
    guardian_name: str = ""
    guardian_contact: str = ""
    # Faculty specific
    designation: str = "Faculty"
    specialization: str = ""
    shift_start: str = "09:00:00"
    shift_end: str = "17:00:00"

@router.get("/generate-id")
def generate_user_id(role: str = "STUDENT", db: Session = Depends(get_db_sync)):
    role_upper = role.strip().upper()
    if role_upper == "STUDENT":
        prefix = "STU"
        base_num = 500
    elif role_upper == "HOD":
        prefix = "HOD"
        base_num = 100
    elif role_upper in ["TEACHER", "SUB_TEACHER"]:
        prefix = "TCH"
        base_num = 200
    else:
        prefix = "STF"
        base_num = 300

    users = db.query(UserModel.user_id).filter(UserModel.user_id.like(f"{prefix}-%")).all()
    max_num = base_num

    for (uid,) in users:
        try:
            parts = uid.split("-")
            if len(parts) >= 2 and parts[1].isdigit():
                num = int(parts[1])
                if num > max_num:
                    max_num = num
        except Exception:
            pass

    next_id = f"{prefix}-{max_num + 1}"
    return {"user_id": next_id, "roll_number": next_id if role_upper == "STUDENT" else ""}

@router.post("/user")
def register_user(req: RegisterUserRequest, db: Session = Depends(get_db_sync)):
    target_role = req.role.strip().upper()
    
    # Auto generate user_id if not provided
    user_id = req.user_id.strip()
    if not user_id:
        gen = generate_user_id(target_role, db)
        user_id = gen["user_id"]

    existing = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"User ID / Roll No '{user_id}' already exists.")

    bgr_img = face_engine.decode_image_base64(req.image_base64)
    if bgr_img is None:
        raise HTTPException(status_code=400, detail="Invalid image data provided.")

    encoding, bbox = face_engine.extract_encoding(bgr_img)
    if encoding is None:
        raise HTTPException(
            status_code=400,
            detail="No face detected in image. Please take a clear face photo."
        )

    # Use custom password if provided, else default to 'password'
    raw_pwd = req.password.strip() if req.password.strip() else "password"
    hashed_pwd = hash_password(raw_pwd)

    new_user = UserModel(
        user_id=user_id,
        name=req.name.strip(),
        email=req.email.strip(),
        phone=req.phone.strip(),
        password_hash=hashed_pwd,
        role=target_role,
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

    if target_role == "STUDENT":
        roll_no = req.roll_number.strip() or user_id
        stu_detail = StudentDetailModel(
            user_id=user_id,
            roll_number=roll_no,
            academic_year=req.academic_year,
            section=req.section.strip(),
            parent_name=req.parent_name.strip(),
            parent_contact=req.parent_contact.strip(),
            guardian_name=req.guardian_name.strip(),
            guardian_contact=req.guardian_contact.strip()
        )
        db.add(stu_detail)
    else:
        fac_detail = FacultyDetailModel(
            user_id=user_id,
            designation=req.designation.strip() or req.role,
            specialization=req.specialization.strip(),
            shift_start=req.shift_start,
            shift_end=req.shift_end,
            assigned_classes_csv=req.subjects_csv.strip()
        )
        db.add(fac_detail)

    db.commit()

    face_engine.reload_encodings(db)

    return {
        "status": "success",
        "message": f"Successfully registered {req.role} {req.name} ({user_id})",
        "user_id": user_id,
        "bbox": bbox
    }
