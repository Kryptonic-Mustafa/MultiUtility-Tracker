from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Index, SmallInteger
from datetime import datetime
from backend.app.core.db import Base

class AdminModel(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    super_admin = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_admin_id", "admin_id"),
        Index("idx_admin_email", "email"),
    )

class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), default="")
    phone = Column(String(50), default="")
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False) # STUDENT, HOD, TEACHER, SUB_TEACHER, STAFF
    dept_id = Column(String(50), default="")
    assigned_modules_csv = Column(Text, default="SMS")
    subjects_csv = Column(Text, default="")
    tags_csv = Column(Text, default="")
    face_encoding = Column(Text, nullable=False) # JSON array string of 128 float values
    profile_image_url = Column(Text, default="")
    is_active = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_user_id", "user_id"),
        Index("idx_role", "role"),
        Index("idx_dept_id", "dept_id"),
        Index("idx_email", "email"),
    )

class DepartmentModel(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dept_id = Column(String(50), nullable=False)
    dept_name = Column(String(100), nullable=False)
    hod_id = Column(String(50), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_dept_id", "dept_id"),
    )

class StudentDetailModel(Base):
    __tablename__ = "student_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    roll_number = Column(String(50), nullable=False)
    academic_year = Column(Integer, nullable=False, default=1)
    section = Column(String(10), default="A")
    guardian_name = Column(String(100), default="")
    guardian_contact = Column(String(20), default="")

    __table_args__ = (
        Index("idx_stu_user_id", "user_id"),
        Index("idx_roll_number", "roll_number"),
    )

class FacultyDetailModel(Base):
    __tablename__ = "faculty_details"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    designation = Column(String(100), nullable=False)
    specialization = Column(String(100), default="")
    shift_start = Column(String(20), default="09:00:00")
    shift_end = Column(String(20), default="17:00:00")
    assigned_classes_csv = Column(Text, default="")

    __table_args__ = (
        Index("idx_fac_user_id", "user_id"),
    )

class AttendanceLogModel(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(50), nullable=False)
    user_role = Column(String(50), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    entry_type = Column(String(20), default="IN") # IN, OUT, MARK
    confidence_score = Column(Float, default=0.0)
    device_info = Column(String(100), default="WebKiosk")

    __table_args__ = (
        Index("idx_log_user_id", "user_id"),
        Index("idx_log_user_role", "user_role"),
        Index("idx_log_timestamp", "timestamp"),
    )
