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

def seed_mustafa_accounts_across_all_modules():
    import bcrypt
    from backend.app.core.db_manager import get_db_session, ensure_database_exists
    from backend.app.models.db_models import UserModel, StudentDetailModel, FacultyDetailModel
    from backend.app.models.master_models import MasterAdminModel

    pwd_hash = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode('utf-8')
    dummy_encoding = "[]"

    # 1. Seed Master Admin in multiutility_master DB
    try:
        master_db = get_db_session("multiutility_master")
        admin = master_db.query(MasterAdminModel).filter(
            (MasterAdminModel.email == "mustafa@gmail.com") | (MasterAdminModel.admin_id == "MUSTAFA-ADMIN")
        ).first()
        if not admin:
            new_admin = MasterAdminModel(
                admin_id="MUSTAFA-ADMIN",
                name="Mustafa Aliasgar Chhabrawala (Master Super Admin)",
                email="mustafa@gmail.com",
                password_hash=pwd_hash,
                super_admin=1
            )
            master_db.add(new_admin)
            master_db.commit()
        else:
            admin.email = "mustafa@gmail.com"
            admin.password_hash = pwd_hash
            master_db.commit()
        master_db.close()
    except Exception as e:
        logger.warning(f"Note on seeding Master Admin Mustafa: {e}")

    # 2. Module DB accounts definitions
    module_accounts = [
        # SMS Module (student_tracker)
        {
            "db_name": "student_tracker",
            "user_id": "STU-503",
            "name": "Mustafa Aliasgar Chhabrawala",
            "email": "mustafa@gmail.com",
            "phone": "+91 9876543210",
            "role": "STUDENT",
            "dept_id": "CSE",
            "assigned_modules": "SMS",
            "is_student": True,
            "roll_number": "STU-503",
            "academic_year": 2,
            "section": "A",
            "parent_name": "Aliasgar Chhabrawala"
        },
        # HR Module (module_hr)
        {
            "db_name": "module_hr",
            "user_id": "EMP-503",
            "name": "Mustafa Chhabrawala (Senior HR Lead)",
            "email": "mustafa@gmail.com",
            "phone": "+91 9876543210",
            "role": "HR_MANAGER",
            "dept_id": "HR",
            "assigned_modules": "HR",
            "is_student": False,
            "designation": "Senior HR Manager",
            "specialization": "Human Capital & Payroll Analytics"
        },
        # Digital Library Module (module_library)
        {
            "db_name": "module_library",
            "user_id": "LIB-503",
            "name": "Mustafa Chhabrawala (Librarian & Borrower)",
            "email": "mustafa@gmail.com",
            "phone": "+91 9876543210",
            "role": "LIBRARIAN",
            "dept_id": "LIB",
            "assigned_modules": "LIBRARY",
            "is_student": False,
            "designation": "Head Librarian",
            "specialization": "Digital Cataloging & Archiving"
        },
        # Hostel Module (module_hostel)
        {
            "db_name": "module_hostel",
            "user_id": "HST-503",
            "name": "Mustafa Chhabrawala (Hostel Warden)",
            "email": "mustafa@gmail.com",
            "phone": "+91 9876543210",
            "role": "HOSTEL_WARDEN",
            "dept_id": "HOSTEL",
            "assigned_modules": "HOSTEL",
            "is_student": False,
            "designation": "Chief Hostel Warden",
            "specialization": "Dormitories & Fleet Logistics"
        }
    ]

    for acc in module_accounts:
        try:
            ensure_database_exists(acc["db_name"])
            db = get_db_session(acc["db_name"])
            
            user = db.query(UserModel).filter(
                (UserModel.user_id == acc["user_id"]) | (UserModel.email == acc["email"])
            ).first()

            if not user:
                user = UserModel(
                    user_id=acc["user_id"],
                    name=acc["name"],
                    email=acc["email"],
                    phone=acc.get("phone", ""),
                    password_hash=pwd_hash,
                    role=acc["role"],
                    dept_id=acc["dept_id"],
                    assigned_modules_csv=acc["assigned_modules"],
                    face_encoding=dummy_encoding,
                    is_active=1
                )
                db.add(user)
                db.flush()
            else:
                user.email = acc["email"]
                user.password_hash = pwd_hash

            if acc.get("is_student"):
                stu = db.query(StudentDetailModel).filter(StudentDetailModel.user_id == user.user_id).first()
                if not stu:
                    stu_detail = StudentDetailModel(
                        user_id=user.user_id,
                        roll_number=acc.get("roll_number", user.user_id),
                        academic_year=acc.get("academic_year", 2),
                        section=acc.get("section", "A"),
                        parent_name=acc.get("parent_name", "Aliasgar Chhabrawala")
                    )
                    db.add(stu_detail)
            else:
                fac = db.query(FacultyDetailModel).filter(FacultyDetailModel.user_id == user.user_id).first()
                if not fac:
                    fac_detail = FacultyDetailModel(
                        user_id=user.user_id,
                        designation=acc.get("designation", "Department Lead"),
                        specialization=acc.get("specialization", "Management")
                    )
                    db.add(fac_detail)

            db.commit()
            db.close()
        except Exception as err:
            logger.warning(f"Note on seeding {acc['user_id']} in {acc['db_name']}: {err}")

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
        seed_mustafa_accounts_across_all_modules()
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
