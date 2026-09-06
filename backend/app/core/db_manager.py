import ssl
import logging
from typing import Dict
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import bcrypt

from backend.app.core.config import DB_BASE_URL, MASTER_SYNC_DATABASE_URL, SYNC_DATABASE_URL
from backend.app.core.db import Base
from backend.app.models.master_models import MasterAdminModel, SystemModuleModel, GlobalConfigModel
from backend.app.models.db_models import (
    UserModel, DepartmentModel, StudentDetailModel, FacultyDetailModel, AttendanceLogModel
)

logger = logging.getLogger("db_manager")

ssl_ctx = ssl.create_default_context()

# Cache created engines for performance
_engines_cache: Dict[str, any] = {}
_sessionmakers_cache: Dict[str, any] = {}

def get_db_engine(db_name: str):
    """Returns or creates a cached SQLAlchemy engine for a given database name."""
    if db_name in _engines_cache:
        return _engines_cache[db_name]

    url = f"{DB_BASE_URL}{db_name}"
    connect_args = {}
    if "tidbcloud.com" in DB_BASE_URL:
        connect_args["ssl"] = ssl_ctx

    eng = create_engine(
        url,
        echo=False,
        pool_recycle=3600,
        pool_pre_ping=True,
        connect_args=connect_args
    )
    _engines_cache[db_name] = eng
    _sessionmakers_cache[db_name] = sessionmaker(bind=eng, autocommit=False, autoflush=False)
    return eng

def get_db_session(db_name: str):
    """Returns a new SQLAlchemy Session bound to the requested database name."""
    if db_name not in _sessionmakers_cache:
        get_db_engine(db_name)
    session_factory = _sessionmakers_cache[db_name]
    return session_factory()

def ensure_database_exists(db_name: str):
    """Executes CREATE DATABASE IF NOT EXISTS on the target MySQL host."""
    try:
        connect_args = {}
        if "tidbcloud.com" in DB_BASE_URL:
            connect_args["ssl"] = ssl_ctx

        # Connect without specifying database name to run raw CREATE DATABASE
        raw_engine = create_engine(
            DB_BASE_URL,
            echo=False,
            pool_pre_ping=True,
            connect_args=connect_args
        )
        with raw_engine.connect() as conn:
            conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
            conn.commit()
        raw_engine.dispose()
        logger.info(f"Database verified/created: {db_name}")
    except Exception as e:
        logger.warning(f"Note on creating database {db_name}: {e}")

def init_master_database():
    """Initializes multiutility_master DB, creates master tables, and seeds default Super Admin & Modules."""
    ensure_database_exists("multiutility_master")
    master_engine = get_db_engine("multiutility_master")
    
    # Create master tables
    Base.metadata.create_all(bind=master_engine)

    # Seed Master Super Admin & Default Modules in multiutility_master
    db = get_db_session("multiutility_master")
    try:
        # Seed Super Admin
        admin = db.query(MasterAdminModel).filter(MasterAdminModel.admin_id == "SUPER-ADMIN").first()
        if not admin:
            pwd_hash = bcrypt.hashpw(b"password", bcrypt.gensalt()).decode('utf-8')
            master_admin = MasterAdminModel(
                admin_id="SUPER-ADMIN",
                name="Master Project Super Admin",
                email="superadmin@university.edu",
                password_hash=pwd_hash,
                super_admin=1
            )
            db.add(master_admin)

        # Seed Default System Modules (all active by default with valid workspace links)
        default_modules = [
            {
                "id": "sms",
                "title": "School Management System (SMS)",
                "db_name": "student_tracker",
                "badge": "Module #1",
                "description": "Biometric face attendance, student management, faculty dashboard, department hierarchy, and daily reports.",
                "icon": "GraduationCap",
                "enabled": 1,
                "display_order": 1,
                "href": "/sms",
                "show_nav_top": 1,
                "show_nav_bottom": 1
            },
            {
                "id": "hr",
                "title": "HR & Payroll Management",
                "db_name": "module_hr",
                "badge": "Module #2",
                "description": "Employee onboarding, salary slip generation, leave approvals, performance evaluations, and tax calculations.",
                "icon": "Briefcase",
                "enabled": 1,
                "display_order": 2,
                "href": "/hr",
                "show_nav_top": 1,
                "show_nav_bottom": 1
            },
            {
                "id": "library",
                "title": "Digital Library System",
                "db_name": "module_library",
                "badge": "Module #3",
                "description": "Book cataloging, barcode scanning, loan tracking, overdue fine calculation, and digital resource access.",
                "icon": "BookOpen",
                "enabled": 1,
                "display_order": 3,
                "href": "/library",
                "show_nav_top": 1,
                "show_nav_bottom": 1
            },
            {
                "id": "hostel",
                "title": "Hostel & Fleet Logistics",
                "db_name": "module_hostel",
                "badge": "Module #4",
                "description": "Dormitory bed allocation, mess bill management, bus route tracking, and visitor pass issuance.",
                "icon": "Bus",
                "enabled": 1,
                "display_order": 4,
                "href": "/hostel",
                "show_nav_top": 1,
                "show_nav_bottom": 1
            }
        ]

        for mod_data in default_modules:
            mod = db.query(SystemModuleModel).filter(SystemModuleModel.id == mod_data["id"]).first()
            if not mod:
                new_mod = SystemModuleModel(**mod_data)
                db.add(new_mod)
            else:
                # Update existing module status to active & update href
                mod.enabled = 1
                mod.href = mod_data["href"]
                mod.db_name = mod_data["db_name"]

            # Provision physical database and base schemas for each module
            try:
                ensure_database_exists(mod_data["db_name"])
                mod_engine = get_db_engine(mod_data["db_name"])
                Base.metadata.create_all(bind=mod_engine)
            except Exception as dberr:
                logger.warning(f"Note on provisioning physical DB {mod_data['db_name']}: {dberr}")

        # Seed Global Config
        cfg = db.query(GlobalConfigModel).first()
        if not cfg:
            db.add(GlobalConfigModel(system_title="MultiUtility Tracker", biometric_threshold=0.60))

        db.commit()
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding master database: {e}")
    finally:
        db.close()

def provision_new_module_db(module_id: str, title: str, badge: str, description: str, icon: str = "Layers"):
    """
    Provision a brand new isolated Module Database (module_<id>),
    initialize default schemas, and register it in Master DB.
    """
    db_name = f"module_{module_id.lower()}"
    ensure_database_exists(db_name)
    
    # Initialize base tables in the new module DB
    mod_engine = get_db_engine(db_name)
    Base.metadata.create_all(bind=mod_engine)

    # Register in Master DB system_modules
    master_db = get_db_session("multiutility_master")
    try:
        # Determine highest order index
        max_order = master_db.query(SystemModuleModel).count() + 1

        mod_entry = master_db.query(SystemModuleModel).filter(SystemModuleModel.id == module_id).first()
        if not mod_entry:
            mod_entry = SystemModuleModel(
                id=module_id.lower(),
                title=title,
                db_name=db_name,
                badge=badge or f"Module #{max_order}",
                description=description,
                icon=icon,
                enabled=1,
                display_order=max_order,
                href=f"/{module_id.lower()}"
            )
            master_db.add(mod_entry)
            master_db.commit()
            logger.info(f"Registered new module '{title}' with DB '{db_name}' in Master DB")
    except Exception as e:
        master_db.rollback()
        logger.error(f"Error registering new module in Master DB: {e}")
        raise e
    finally:
        master_db.close()

    return {"status": "success", "module_id": module_id, "db_name": db_name}
