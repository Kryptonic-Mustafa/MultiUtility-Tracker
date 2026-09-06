import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from sqlalchemy import text
from backend.app.core.db import engine, Base, SessionLocal
from backend.app.core.face_engine import face_engine
from backend.app.api.auth import router as auth_router
from backend.app.api.register import router as register_router
from backend.app.api.students import router as students_router
from backend.app.api.faculty import router as faculty_router
from backend.app.api.departments import router as departments_router
from backend.app.api.attendance import router as attendance_router
from backend.app.api.websocket import router as ws_router
from backend.app.api.admin import router as admin_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

def seed_department_admins_and_principals(db):
    from backend.app.models.db_models import UserModel, FacultyDetailModel
    import bcrypt

    pwd_hash = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode('utf-8')
    
    accounts = [
        # Master System / Project Super Admin
        {"user_id": "SUPER-ADMIN", "name": "Master Project Super Admin", "role": "SUPER_ADMIN", "dept_id": "ALL", "email": "superadmin@university.edu"},

        # Department Admins (Full Add, Update, Delete access for their department)
        {"user_id": "CSE-ADMIN", "name": "CSE Department Admin", "role": "ADMIN", "dept_id": "CSE", "email": "admin.cse@university.edu"},
        {"user_id": "ECE-ADMIN", "name": "ECE Department Admin", "role": "ADMIN", "dept_id": "ECE", "email": "admin.ece@university.edu"},
        {"user_id": "MECH-ADMIN", "name": "MECH Department Admin", "role": "ADMIN", "dept_id": "MECH", "email": "admin.mech@university.edu"},
        {"user_id": "IT-ADMIN", "name": "IT Department Admin", "role": "ADMIN", "dept_id": "IT", "email": "admin.it@university.edu"},
        {"user_id": "CIVIL-ADMIN", "name": "CIVIL Department Admin", "role": "ADMIN", "dept_id": "CIVIL", "email": "admin.civil@university.edu"},

        # Principals / Executive Viewers (Read-only viewers)
        {"user_id": "CSE-PRINCIPAL", "name": "Dr. Arvind Rao (CSE Principal)", "role": "PRINCIPAL", "dept_id": "CSE", "email": "principal.cse@university.edu"},
        {"user_id": "COLLEGE-PRINCIPAL", "name": "Dr. K. V. Subramaniam (College Principal)", "role": "PRINCIPAL", "dept_id": "ALL", "email": "principal@university.edu"},
    ]

    dummy_encoding = "[]"

    for acc in accounts:
        user = db.query(UserModel).filter(UserModel.user_id == acc["user_id"]).first()
        if not user:
            new_user = UserModel(
                user_id=acc["user_id"],
                name=acc["name"],
                email=acc["email"],
                password_hash=pwd_hash,
                role=acc["role"],
                dept_id=acc["dept_id"],
                assigned_modules_csv="SMS,ADMIN_PANEL" if acc["role"] == "ADMIN" else "SMS",
                face_encoding=dummy_encoding,
                is_active=1
            )
            db.add(new_user)
            db.flush()

            fac = db.query(FacultyDetailModel).filter(FacultyDetailModel.user_id == acc["user_id"]).first()
            if not fac:
                fac_detail = FacultyDetailModel(
                    user_id=acc["user_id"],
                    designation="Department Administrator" if acc["role"] == "ADMIN" else "Principal / Executive Director",
                    specialization="Academic Administration"
                )
                db.add(fac_detail)

    db.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing Master DB (multiutility_master) and Module DBs...")
    from backend.app.core.db_manager import init_master_database
    
    # 1. Initialize Master DB & Seed Master Super Admin
    init_master_database()
    
    # 2. Initialize Module #1 DB (student_tracker / module_sms)
    Base.metadata.create_all(bind=engine)
    
    # Auto-add missing columns to existing MySQL tables
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT ''"))
            conn.commit()
        except Exception:
            pass # Column already exists

        try:
            conn.execute(text("ALTER TABLE student_details ADD COLUMN parent_name VARCHAR(100) DEFAULT ''"))
            conn.commit()
        except Exception:
            pass

        try:
            conn.execute(text("ALTER TABLE student_details ADD COLUMN parent_contact VARCHAR(20) DEFAULT ''"))
            conn.commit()
        except Exception:
            pass
            
    logger.info("Master DB & Module DB tables verified.")

    db = SessionLocal()
    try:
        seed_department_admins_and_principals(db)
        face_engine.reload_encodings(db)
    finally:
        db.close()

    yield
    logger.info("Shutting down MultiUtility Tracker API server...")

app = FastAPI(
    title="MultiUtility Tracker Engine",
    description="Enterprise Multi-Purpose Modular Utility Platform & School Management System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(register_router)
app.include_router(students_router)
app.include_router(faculty_router)
app.include_router(departments_router)
app.include_router(attendance_router)
app.include_router(ws_router)
app.include_router(admin_router)

@app.get("/")
def root():
    return {
        "system": "MultiUtility Tracker Platform API",
        "status": "Online",
        "module": "SMS (School Management System)",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
