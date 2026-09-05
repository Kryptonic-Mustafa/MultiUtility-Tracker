import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.db import engine, Base
from backend.app.models.db_models import AdminModel, UserModel, DepartmentModel, StudentDetailModel, FacultyDetailModel, AttendanceLogModel

def init():
    print("Connecting to TiDB Cloud MySQL and creating table schemas...")
    Base.metadata.create_all(bind=engine)
    print("All database tables created successfully on TiDB Cloud MySQL!")

if __name__ == "__main__":
    init()
