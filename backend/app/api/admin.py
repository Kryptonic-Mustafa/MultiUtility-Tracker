import os
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.app.core.db import get_db_sync
from backend.app.core.db_manager import get_db_session, provision_new_module_db
from backend.app.models.master_models import MasterAdminModel, SystemModuleModel, GlobalConfigModel
from backend.app.models.db_models import (
    UserModel, DepartmentModel, StudentDetailModel, FacultyDetailModel, AttendanceLogModel
)

router = APIRouter(prefix="/api/admin", tags=["Master System Admin"])

DEFAULT_MODULES = [
    {
        "id": "sms",
        "title": "School Management System (SMS)",
        "db_name": "student_tracker",
        "badge": "Module #1",
        "description": "Biometric face attendance, student management, faculty dashboard, department hierarchy, and daily reports.",
        "icon": "GraduationCap",
        "enabled": True,
        "order": 1,
        "href": "/sms",
        "show_nav_top": True,
        "show_nav_bottom": True
    },
    {
        "id": "hr",
        "title": "HR & Payroll Management",
        "db_name": "module_hr",
        "badge": "Module #2",
        "description": "Employee onboarding, salary slip generation, leave approvals, performance evaluations, and tax calculations.",
        "icon": "Briefcase",
        "enabled": True,
        "order": 2,
        "href": "/hr",
        "show_nav_top": True,
        "show_nav_bottom": True
    },
    {
        "id": "library",
        "title": "Digital Library System",
        "db_name": "module_library",
        "badge": "Module #3",
        "description": "Book cataloging, barcode scanning, loan tracking, overdue fine calculation, and digital resource access.",
        "icon": "BookOpen",
        "enabled": True,
        "order": 3,
        "href": "/library",
        "show_nav_top": True,
        "show_nav_bottom": True
    },
    {
        "id": "hostel",
        "title": "Hostel & Fleet Logistics",
        "db_name": "module_hostel",
        "badge": "Module #4",
        "description": "Dormitory bed allocation, mess bill management, bus route tracking, and visitor pass issuance.",
        "icon": "Bus",
        "enabled": True,
        "order": 4,
        "href": "/hostel",
        "show_nav_top": True,
        "show_nav_bottom": True
    }
]

@router.get("/config")
def get_system_config():
    try:
        master_db = get_db_session("multiutility_master")
        try:
            modules_rows = master_db.query(SystemModuleModel).order_by(SystemModuleModel.display_order.asc()).all()
            cfg_row = master_db.query(GlobalConfigModel).first()

            if modules_rows:
                modules_list = []
                for m in modules_rows:
                    modules_list.append({
                        "id": m.id,
                        "title": m.title,
                        "db_name": m.db_name,
                        "badge": m.badge,
                        "description": m.description,
                        "icon": m.icon,
                        "enabled": bool(m.enabled),
                        "order": m.display_order,
                        "href": m.href or f"/{m.id}",
                        "show_nav_top": bool(m.show_nav_top),
                        "show_nav_bottom": bool(m.show_nav_bottom)
                    })
                
                return {
                    "modules": modules_list,
                    "biometric_threshold": cfg_row.biometric_threshold if cfg_row else 0.60,
                    "system_title": cfg_row.system_title if cfg_row else "MultiUtility Tracker"
                }
        finally:
            master_db.close()
    except Exception as e:
        print(f"Fallback reading config: {e}")

    return {"modules": DEFAULT_MODULES, "biometric_threshold": 0.60, "system_title": "MultiUtility Tracker"}

@router.post("/config")
def update_system_config(config: dict):
    try:
        master_db = get_db_session("multiutility_master")
        try:
            # Update Modules
            if "modules" in config and isinstance(config["modules"], list):
                for idx, mod in enumerate(config["modules"]):
                    db_target = mod.get("db_name", f"module_{mod['id']}")
                    m_row = master_db.query(SystemModuleModel).filter(SystemModuleModel.id == mod.get("id")).first()
                    if m_row:
                        m_row.title = mod.get("title", m_row.title)
                        m_row.badge = mod.get("badge", m_row.badge)
                        m_row.description = mod.get("description", m_row.description)
                        m_row.enabled = 1 if mod.get("enabled") else 0
                        m_row.display_order = mod.get("order", idx + 1)
                        if "db_name" in mod:
                            m_row.db_name = mod["db_name"]
                        if "href" in mod and mod["href"] != "#":
                            m_row.href = mod["href"]
                        else:
                            m_row.href = f"/{mod['id']}"
                    else:
                        new_m = SystemModuleModel(
                            id=mod["id"],
                            title=mod.get("title", mod["id"]),
                            db_name=db_target,
                            badge=mod.get("badge", "Module"),
                            description=mod.get("description", ""),
                            icon=mod.get("icon", "Layers"),
                            enabled=1 if mod.get("enabled") else 0,
                            display_order=mod.get("order", idx + 1),
                            href=mod.get("href") if (mod.get("href") and mod.get("href") != "#") else f"/{mod['id']}"
                        )
                        master_db.add(new_m)

                    # Auto-provision physical DB & base schemas if enabled
                    if mod.get("enabled"):
                        try:
                            from backend.app.core.db_manager import ensure_database_exists, get_db_engine, Base
                            ensure_database_exists(db_target)
                            mod_engine = get_db_engine(db_target)
                            Base.metadata.create_all(bind=mod_engine)
                        except Exception as p_err:
                            print(f"Note on auto-provisioning physical DB {db_target}: {p_err}")

            # Update Global Config
            cfg_row = master_db.query(GlobalConfigModel).first()
            if not cfg_row:
                cfg_row = GlobalConfigModel()
                master_db.add(cfg_row)

            if "system_title" in config:
                cfg_row.system_title = config["system_title"]
            if "biometric_threshold" in config:
                cfg_row.biometric_threshold = float(config["biometric_threshold"])

            master_db.commit()
            return {"status": "success", "message": "System configuration saved to Master Database"}
        finally:
            master_db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update master config: {str(e)}")

class CreateModuleRequest(BaseModel):
    id: str
    title: str
    badge: Optional[str] = ""
    description: Optional[str] = ""
    icon: Optional[str] = "Layers"

@router.post("/modules/create")
def create_new_module(req: CreateModuleRequest):
    if not req.id.strip() or not req.title.strip():
        raise HTTPException(status_code=400, detail="Module ID and Title are required")
    
    try:
        res = provision_new_module_db(
            module_id=req.id.strip().lower(),
            title=req.title.strip(),
            badge=req.badge.strip(),
            description=req.description.strip(),
            icon=req.icon or "Layers"
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to provision module database: {str(e)}")

@router.get("/databases")
def get_available_databases():
    databases = [
        {"db_name": "multiutility_master", "label": "👑 Master Control DB (multiutility_master)", "type": "MASTER"},
        {"db_name": "student_tracker", "label": "🎓 Module #1 DB (student_tracker / module_sms)", "type": "MODULE"}
    ]

    try:
        master_db = get_db_session("multiutility_master")
        try:
            modules = master_db.query(SystemModuleModel).all()
            for m in modules:
                if m.db_name not in ["student_tracker", "multiutility_master"]:
                    databases.append({
                        "db_name": m.db_name,
                        "label": f"📦 {m.title} DB ({m.db_name})",
                        "type": "MODULE"
                    })
        finally:
            master_db.close()
    except Exception:
        pass

    return databases

@router.get("/tables")
def get_database_tables(db_name: str = "student_tracker"):
    if db_name == "multiutility_master":
        return [
            {"name": "master_admins", "label": "Master Super Admins (master_admins)"},
            {"name": "system_modules", "label": "System Modules Registry (system_modules)"},
            {"name": "global_config", "label": "Global System Settings (global_config)"}
        ]
    else:
        return [
            {"name": "users", "label": "User Accounts (users)"},
            {"name": "departments", "label": "Departments (departments)"},
            {"name": "student_details", "label": "Student Details (student_details)"},
            {"name": "faculty_details", "label": "Faculty Details (faculty_details)"},
            {"name": "attendance_logs", "label": "Attendance Logs (attendance_logs)"}
        ]

@router.get("/table-data")
def get_table_data(table_name: str, db_name: str = "student_tracker", limit: int = 200):
    try:
        db = get_db_session(db_name)
        try:
            if db_name == "multiutility_master":
                if table_name == "master_admins":
                    rows = db.query(MasterAdminModel).order_by(MasterAdminModel.id.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name == "system_modules":
                    rows = db.query(SystemModuleModel).order_by(SystemModuleModel.display_order.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name == "global_config":
                    rows = db.query(GlobalConfigModel).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
            else:
                if table_name == "users":
                    rows = db.query(UserModel).order_by(UserModel.user_id.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name == "departments":
                    rows = db.query(DepartmentModel).order_by(DepartmentModel.dept_id.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name in ["student_details", "student_profiles"]:
                    rows = db.query(StudentDetailModel).order_by(StudentDetailModel.user_id.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name in ["faculty_details", "faculty_profiles"]:
                    rows = db.query(FacultyDetailModel).order_by(FacultyDetailModel.user_id.asc()).limit(limit).all()
                    return [{c.name: getattr(r, c.name) for c in r.__table__.columns} for r in rows]
                elif table_name == "attendance_logs":
                    rows = db.query(AttendanceLogModel).order_by(AttendanceLogModel.timestamp.desc()).limit(limit).all()
                    data = []
                    for r in rows:
                        item = {c.name: getattr(r, c.name) for c in r.__table__.columns}
                        if item.get("timestamp"):
                            item["timestamp"] = item["timestamp"].isoformat()
                        data.append(item)
                    return data

            raise HTTPException(status_code=400, detail=f"Table {table_name} not found in database {db_name}")
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading table data: {str(e)}")

class UpdateRowRequest(BaseModel):
    table_name: str
    db_name: Optional[str] = "student_tracker"
    key_field: str
    key_value: Any
    data: Dict[str, Any]

@router.post("/table-data/update")
def update_table_row(req: UpdateRowRequest):
    target_db = req.db_name or "student_tracker"
    try:
        db = get_db_session(target_db)
        try:
            model_map = {
                "master_admins": MasterAdminModel,
                "system_modules": SystemModuleModel,
                "global_config": GlobalConfigModel,
                "users": UserModel,
                "departments": DepartmentModel,
                "student_details": StudentDetailModel,
                "faculty_details": FacultyDetailModel,
                "attendance_logs": AttendanceLogModel
            }

            model_cls = model_map.get(req.table_name)
            if not model_cls:
                raise HTTPException(status_code=400, detail="Invalid table name")

            field_attr = getattr(model_cls, req.key_field, None)
            if not field_attr:
                raise HTTPException(status_code=400, detail=f"Invalid key field {req.key_field}")

            record = db.query(model_cls).filter(field_attr == req.key_value).first()
            if not record:
                raise HTTPException(status_code=404, detail="Record not found")

            for k, v in req.data.items():
                if hasattr(record, k) and k != req.key_field:
                    setattr(record, k, v)

            db.commit()
            return {"status": "success", "message": f"Updated record in {req.table_name} ({target_db})"}
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update record: {str(e)}")

@router.delete("/table-data/delete")
def delete_table_row(table_name: str, key_field: str, key_value: str, db_name: str = "student_tracker"):
    try:
        db = get_db_session(db_name)
        try:
            model_map = {
                "master_admins": MasterAdminModel,
                "system_modules": SystemModuleModel,
                "global_config": GlobalConfigModel,
                "users": UserModel,
                "departments": DepartmentModel,
                "student_details": StudentDetailModel,
                "faculty_details": FacultyDetailModel,
                "attendance_logs": AttendanceLogModel
            }

            model_cls = model_map.get(table_name)
            if not model_cls:
                raise HTTPException(status_code=400, detail="Invalid table name")

            field_attr = getattr(model_cls, key_field, None)
            if not field_attr:
                raise HTTPException(status_code=400, detail=f"Invalid key field {key_field}")

            record = db.query(model_cls).filter(field_attr == key_value).first()
            if not record:
                raise HTTPException(status_code=404, detail="Record not found")

            db.delete(record)
            db.commit()
            return {"status": "success", "message": f"Deleted record from {table_name} ({db_name})"}
        finally:
            db.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete record: {str(e)}")
