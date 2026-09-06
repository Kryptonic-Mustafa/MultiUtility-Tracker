from sqlalchemy import Column, Integer, String, Text, Float, DateTime, SmallInteger, Index
from datetime import datetime
from backend.app.core.db import Base

class MasterAdminModel(Base):
    __tablename__ = "master_admins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    admin_id = Column(String(50), nullable=False, unique=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    super_admin = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_master_admin_id", "admin_id"),
        Index("idx_master_admin_email", "email"),
    )

class SystemModuleModel(Base):
    __tablename__ = "system_modules"

    id = Column(String(50), primary_key=True) # e.g. "sms", "hr", "library", "hostel"
    title = Column(String(100), nullable=False)
    db_name = Column(String(100), nullable=False) # e.g. "student_tracker", "module_hr"
    badge = Column(String(50), default="Module")
    description = Column(Text, default="")
    icon = Column(String(50), default="Layers")
    enabled = Column(SmallInteger, default=1) # 1 active, 0 disabled
    display_order = Column(Integer, default=1)
    href = Column(String(100), default="#")
    show_nav_top = Column(SmallInteger, default=1)
    show_nav_bottom = Column(SmallInteger, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("idx_module_order", "display_order"),
    )

class GlobalConfigModel(Base):
    __tablename__ = "global_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    system_title = Column(String(150), default="MultiUtility Tracker")
    biometric_threshold = Column(Float, default=0.60)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
