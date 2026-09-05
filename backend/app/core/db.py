import ssl
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from backend.app.core.config import DATABASE_URL, SYNC_DATABASE_URL

# SSL context for TiDB Cloud MySQL
ssl_ctx = ssl.create_default_context()

# High-performance SQLAlchemy Engine using PyMySQL
engine = create_engine(
    SYNC_DATABASE_URL,
    echo=False,
    pool_recycle=3600,
    pool_pre_ping=True,
    connect_args={"ssl": ssl_ctx}
)

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

def get_db_sync():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_db():
    """Async session provider using threadpool executor for zero-blocking IO."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
