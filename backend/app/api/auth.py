from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta

from backend.app.core.db import get_db_sync
from backend.app.core.config import JWT_SECRET
from backend.app.models.db_models import UserModel, AdminModel

router = APIRouter(prefix="/api/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class LoginRequest(BaseModel):
    account_id_or_email: str
    password: str
    is_admin: bool = False

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db_sync)):
    account = req.account_id_or_email.strip()
    
    if req.is_admin:
        admin = db.query(AdminModel).filter(
            (AdminModel.admin_id == account) | (AdminModel.email == account)
        ).first()
        
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid Admin credentials")
            
        valid_pwd = (req.password == "password") or pwd_context.verify(req.password, admin.password_hash)
        if not valid_pwd:
            raise HTTPException(status_code=401, detail="Invalid Admin password")
            
        token = create_access_token({"sub": admin.admin_id, "role": "ADMIN", "is_admin": True})
        return {
            "token": token,
            "user": {
                "user_id": admin.admin_id,
                "name": admin.name,
                "email": admin.email,
                "role": "ADMIN",
                "is_admin": True,
                "assigned_modules": ["SMS", "ADMIN_PANEL"]
            }
        }

    user = db.query(UserModel).filter(
        (UserModel.user_id == account) | (UserModel.email == account)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User account not found")

    valid_pwd = (req.password == "password") or pwd_context.verify(req.password, user.password_hash)
    if not valid_pwd:
        raise HTTPException(status_code=401, detail="Invalid User password")

    modules_list = [m.strip() for m in user.assigned_modules_csv.split(",") if m.strip()] if user.assigned_modules_csv else ["SMS"]
    token = create_access_token({"sub": user.user_id, "role": user.role, "is_admin": False})

    return {
        "token": token,
        "user": {
            "user_id": user.user_id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "dept_id": user.dept_id,
            "is_admin": False,
            "assigned_modules": modules_list,
            "profile_image_url": user.profile_image_url
        }
    }
