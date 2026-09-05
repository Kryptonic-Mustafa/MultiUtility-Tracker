import os
import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.app.core.db import get_db_sync
from backend.app.models.db_models import (
    UserModel, DepartmentModel, StudentDetailModel, FacultyDetailModel, AttendanceLogModel
)

router = APIRouter(prefix="/api/admin", tags=["Master System Admin"])

CONFIG_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "system_config.json")

DEFAULT_MODULES = [
    {
        "id": "sms",
        "title": "School Management System (SMS)",
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
        "badge": "Module #2",
        "description": "Employee onboarding, salary slip generation, leave approvals, performance evaluations, and tax calculations.",
        "icon": "Briefcase",
        "enabled": False,
        "order": 2,
        "href": "#",
        "show_nav_top": True,
        "show_nav_bottom": False
    },
    {
        "id": "library",
        "title": "Digital Library System",
        "badge": "Module #3",
        "description": "Book cataloging, barcode scanning, loan tracking, overdue fine calculation, and digital resource access.",
        "icon": "BookOpen",
        "enabled": False,
        "order": 3,
        "href": "#",
        "show_nav_top": True,
        "show_nav_bottom": False
    },
    {
        "id": "hostel",
        "title": "Hostel & Fleet Logistics",
        "badge": "Module #4",
        "description": "Dormitory bed allocation, mess bill management, bus route tracking, and visitor pass issuance.",
        "icon": "Bus",
        "enabled": False,
        "order": 4,
        "href": "#",
        "show_nav_top": False,
        "show_nav_bottom": False
    }
]

def load_system_config() -> dict:
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {"modules": DEFAULT_MODULES, "biometric_threshold": 0.60, "system_title": "MultiUtility Tracker"}

def save_system_config(config: dict):
    os.makedirs(os.path.dirname(CONFIG_FILE), exist_ok=True)
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=2)

@router.get("/config")
def get_system_config():
    return load_system_config()

@router.post("/config")
def update_system_config(config: dict):
    save_system_config(config)
    return {"status": "success", "message": "System configuration updated successfully", "config": config}

@router.get("/tables")
def get_database_tables():
    return [
        {"name": "users", "label": "User Accounts (users)"},
        {"name": "departments", "label": "Departments (departments)"},
        {"name": "student_details", "label": "Student Details (student_details)"},
        {"name": "faculty_details", "label": "Faculty Details (faculty_details)"},
        {"name": "attendance_logs", "label": "Attendance Logs (attendance_logs)"}
    ]

@router.get("/table-data")
def get_table_data(table_name: str, limit: int = 200, db: Session = Depends(get_db_sync)):
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
    else:
        raise HTTPException(status_code=400, detail="Invalid table name")

class UpdateRowRequest(BaseModel):
    table_name: str
    key_field: str # e.g. "user_id" or "id" or "dept_id"
    key_value: Any
    data: Dict[str, Any]

@router.post("/table-data/update")
def update_table_row(req: UpdateRowRequest, db: Session = Depends(get_db_sync)):
    model_map = {
        "users": UserModel,
        "departments": DepartmentModel,
        "student_details": StudentDetailModel,
        "student_profiles": StudentDetailModel,
        "faculty_details": FacultyDetailModel,
        "faculty_profiles": FacultyDetailModel,
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
    return {"status": "success", "message": f"Updated record in {req.table_name}"}

@router.delete("/table-data/delete")
def delete_table_row(table_name: str, key_field: str, key_value: str, db: Session = Depends(get_db_sync)):
    model_map = {
        "users": UserModel,
        "departments": DepartmentModel,
        "student_details": StudentDetailModel,
        "student_profiles": StudentDetailModel,
        "faculty_details": FacultyDetailModel,
        "faculty_profiles": FacultyDetailModel,
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
    return {"status": "success", "message": f"Deleted record from {table_name}"}
