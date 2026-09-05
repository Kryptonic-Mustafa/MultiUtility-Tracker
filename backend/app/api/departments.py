from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.app.core.db import get_db_sync
from backend.app.models.db_models import DepartmentModel

router = APIRouter(prefix="/api/departments", tags=["Departments"])

class CreateDepartmentRequest(BaseModel):
    dept_id: str
    dept_name: str
    hod_id: str = ""

@router.get("")
def get_departments(db: Session = Depends(get_db_sync)):
    depts = db.query(DepartmentModel).all()

    output = []
    for d in depts:
        output.append({
            "dept_id": d.dept_id,
            "dept_name": d.dept_name,
            "hod_id": d.hod_id,
            "created_at": d.created_at.isoformat() if d.created_at else None
        })
    return output

@router.post("")
def create_department(req: CreateDepartmentRequest, db: Session = Depends(get_db_sync)):
    existing = db.query(DepartmentModel).filter(DepartmentModel.dept_id == req.dept_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Department ID already exists")

    new_dept = DepartmentModel(
        dept_id=req.dept_id.strip(),
        dept_name=req.dept_name.strip(),
        hod_id=req.hod_id.strip()
    )
    db.add(new_dept)
    db.commit()
    return {"status": "success", "message": f"Created department {req.dept_name}"}
