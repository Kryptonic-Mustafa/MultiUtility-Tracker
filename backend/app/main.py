import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from backend.app.core.db import engine, Base, SessionLocal
from backend.app.core.face_engine import face_engine
from backend.app.api.auth import router as auth_router
from backend.app.api.register import router as register_router
from backend.app.api.students import router as students_router
from backend.app.api.faculty import router as faculty_router
from backend.app.api.departments import router as departments_router
from backend.app.api.attendance import router as attendance_router
from backend.app.api.websocket import router as ws_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing TiDB Cloud MySQL tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified.")

    db = SessionLocal()
    try:
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
