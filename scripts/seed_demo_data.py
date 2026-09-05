import json
import bcrypt
from datetime import datetime, timedelta
from backend.app.core.db import engine, SessionLocal
from backend.app.models.db_models import (
    Base, UserModel, DepartmentModel, StudentDetailModel, FacultyDetailModel, AttendanceLogModel
)

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    return bcrypt.hashpw(pwd_bytes, bcrypt.gensalt()).decode('utf-8')

# Dummy 128-dimensional face encoding vector
DEFAULT_ENCODING = json.dumps([0.01 * (i % 10) for i in range(128)])

DEPARTMENTS = [
    {"dept_id": "CSE", "dept_name": "Computer Science & Engineering", "hod_id": "HOD-CSE-01"},
    {"dept_id": "ECE", "dept_name": "Electronics & Communication", "hod_id": "HOD-ECE-01"},
    {"dept_id": "MECH", "dept_name": "Mechanical Engineering", "hod_id": "HOD-MECH-01"},
    {"dept_id": "IT", "dept_name": "Information Technology", "hod_id": "HOD-IT-01"},
    {"dept_id": "CIVIL", "dept_name": "Civil Engineering", "hod_id": "HOD-CIVIL-01"},
]

FACULTY_USERS = [
    # HODs
    {"user_id": "HOD-CSE-01", "name": "Dr. Rajesh Sharma", "email": "hod.cse@university.edu", "role": "HOD", "dept_id": "CSE", "designation": "Head of Department", "specialization": "Artificial Intelligence"},
    {"user_id": "HOD-ECE-01", "name": "Dr. Suresh Nair", "email": "hod.ece@university.edu", "role": "HOD", "dept_id": "ECE", "designation": "Head of Department", "specialization": "VLSI Design"},
    {"user_id": "HOD-MECH-01", "name": "Dr. Vikramaditya Joshi", "email": "hod.mech@university.edu", "role": "HOD", "dept_id": "MECH", "designation": "Head of Department", "specialization": "Thermodynamics"},
    {"user_id": "HOD-IT-01", "name": "Dr. Sunita Deshmukh", "email": "hod.it@university.edu", "role": "HOD", "dept_id": "IT", "designation": "Head of Department", "specialization": "Cloud Computing"},
    {"user_id": "HOD-CIVIL-01", "name": "Dr. Ramesh Chandra", "email": "hod.civil@university.edu", "role": "HOD", "dept_id": "CIVIL", "designation": "Head of Department", "specialization": "Structural Engineering"},

    # Teachers
    {"user_id": "TCH-CSE-01", "name": "Prof. Anita Roy", "email": "teacher.cse@university.edu", "role": "TEACHER", "dept_id": "CSE", "designation": "Senior Assistant Professor", "specialization": "Data Structures & Algorithms"},
    {"user_id": "TCH-ECE-01", "name": "Prof. Neha Gupta", "email": "teacher.ece@university.edu", "role": "TEACHER", "dept_id": "ECE", "designation": "Assistant Professor", "specialization": "Embedded Systems"},
    {"user_id": "TCH-MECH-01", "name": "Prof. Kabir Khan", "email": "teacher.mech@university.edu", "role": "TEACHER", "dept_id": "MECH", "designation": "Associate Professor", "specialization": "Fluid Mechanics"},
    {"user_id": "TCH-IT-01", "name": "Prof. Alok Kumar", "email": "teacher.it@university.edu", "role": "TEACHER", "dept_id": "IT", "designation": "Assistant Professor", "specialization": "Web Engineering"},
    {"user_id": "TCH-CIVIL-01", "name": "Prof. Meera Reddy", "email": "teacher.civil@university.edu", "role": "TEACHER", "dept_id": "CIVIL", "designation": "Assistant Professor", "specialization": "Environmental Science"},

    # Sub-Teacher & Staff
    {"user_id": "SUB-CSE-01", "name": "Mr. Vikram Singh", "email": "subteacher.cse@university.edu", "role": "SUB_TEACHER", "dept_id": "CSE", "designation": "Lab Assistant", "specialization": "Python Lab"},
    {"user_id": "STAFF-01", "name": "Mrs. Kavita Saxena", "email": "staff@university.edu", "role": "STAFF", "dept_id": "CSE", "designation": "Department Administrator", "specialization": "Academic Operations"},
]

STUDENT_USERS = [
    {"user_id": "STU-503", "name": "Mustafa Aliasgar Chhabrawala", "email": "mustafa@university.edu", "dept_id": "CSE", "roll_number": "STU-503", "academic_year": 2, "section": "A", "guardian_name": "Aliasgar Chhabrawala", "guardian_contact": "+91 9876543210"},
    {"user_id": "STU-102", "name": "Rahul Verma", "email": "rahul@university.edu", "dept_id": "CSE", "roll_number": "STU-102", "academic_year": 2, "section": "A", "guardian_name": "Sanjay Verma", "guardian_contact": "+91 9876543211"},
    {"user_id": "STU-103", "name": "Priya Patel", "email": "priya@university.edu", "dept_id": "CSE", "roll_number": "STU-103", "academic_year": 2, "section": "A", "guardian_name": "Dinesh Patel", "guardian_contact": "+91 9876543212"},
    {"user_id": "STU-104", "name": "Aarav Mehta", "email": "aarav@university.edu", "dept_id": "CSE", "roll_number": "STU-104", "academic_year": 1, "section": "B", "guardian_name": "Rajesh Mehta", "guardian_contact": "+91 9876543213"},
    
    {"user_id": "STU-201", "name": "Rohan Iyer", "email": "rohan@university.edu", "dept_id": "ECE", "roll_number": "STU-201", "academic_year": 2, "section": "A", "guardian_name": "Subramanian Iyer", "guardian_contact": "+91 9876543214"},
    {"user_id": "STU-202", "name": "Ananya Sen", "email": "ananya@university.edu", "dept_id": "ECE", "roll_number": "STU-202", "academic_year": 2, "section": "B", "guardian_name": "Amit Sen", "guardian_contact": "+91 9876543215"},
    
    {"user_id": "STU-301", "name": "Dev Kulkarni", "email": "dev@university.edu", "dept_id": "MECH", "roll_number": "STU-301", "academic_year": 3, "section": "A", "guardian_name": "Prakash Kulkarni", "guardian_contact": "+91 9876543216"},
    
    {"user_id": "STU-401", "name": "Siddharth Malhotra", "email": "siddharth@university.edu", "dept_id": "IT", "roll_number": "STU-401", "academic_year": 2, "section": "B", "guardian_name": "Sunil Malhotra", "guardian_contact": "+91 9876543217"},
    
    {"user_id": "STU-501", "name": "Kavya Sharma", "email": "kavya@university.edu", "dept_id": "CIVIL", "roll_number": "STU-501", "academic_year": 1, "section": "A", "guardian_name": "Vijay Sharma", "guardian_contact": "+91 9876543218"},
]

def seed_database():
    print("Starting MultiUtility Tracker Database Seeding...")
    db = SessionLocal()
    default_password_hash = hash_password("password")

    try:
        # 1. Seed Departments
        for dept in DEPARTMENTS:
            existing = db.query(DepartmentModel).filter(DepartmentModel.dept_id == dept["dept_id"]).first()
            if not existing:
                db.add(DepartmentModel(
                    dept_id=dept["dept_id"],
                    dept_name=dept["dept_name"],
                    hod_id=dept["hod_id"]
                ))
            else:
                existing.dept_name = dept["dept_name"]
                existing.hod_id = dept["hod_id"]
        db.commit()
        print("[OK] Departments seeded successfully.")

        # 2. Seed Faculty Users & Details
        for fac in FACULTY_USERS:
            usr = db.query(UserModel).filter(UserModel.user_id == fac["user_id"]).first()
            if not usr:
                usr = UserModel(
                    user_id=fac["user_id"],
                    name=fac["name"],
                    email=fac["email"],
                    password_hash=default_password_hash,
                    role=fac["role"],
                    dept_id=fac["dept_id"],
                    assigned_modules_csv="SMS",
                    face_encoding=DEFAULT_ENCODING,
                    is_active=1
                )
                db.add(usr)
                db.flush()
            else:
                usr.name = fac["name"]
                usr.email = fac["email"]
                usr.role = fac["role"]
                usr.dept_id = fac["dept_id"]

            detail = db.query(FacultyDetailModel).filter(FacultyDetailModel.user_id == fac["user_id"]).first()
            if not detail:
                db.add(FacultyDetailModel(
                    user_id=fac["user_id"],
                    designation=fac["designation"],
                    specialization=fac["specialization"],
                    shift_start="09:00:00",
                    shift_end="17:00:00"
                ))
            else:
                detail.designation = fac["designation"]
                detail.specialization = fac["specialization"]

        db.commit()
        print("[OK] Faculty & HOD accounts seeded successfully.")

        # 3. Seed Student Users & Details
        for stu in STUDENT_USERS:
            usr = db.query(UserModel).filter(UserModel.user_id == stu["user_id"]).first()
            if not usr:
                usr = UserModel(
                    user_id=stu["user_id"],
                    name=stu["name"],
                    email=stu["email"],
                    password_hash=default_password_hash,
                    role="STUDENT",
                    dept_id=stu["dept_id"],
                    assigned_modules_csv="SMS",
                    face_encoding=DEFAULT_ENCODING,
                    is_active=1
                )
                db.add(usr)
                db.flush()
            else:
                usr.name = stu["name"]
                usr.email = stu["email"]
                usr.role = "STUDENT"
                usr.dept_id = stu["dept_id"]

            detail = db.query(StudentDetailModel).filter(StudentDetailModel.user_id == stu["user_id"]).first()
            if not detail:
                db.add(StudentDetailModel(
                    user_id=stu["user_id"],
                    roll_number=stu["roll_number"],
                    academic_year=stu["academic_year"],
                    section=stu["section"],
                    guardian_name=stu["guardian_name"],
                    guardian_contact=stu["guardian_contact"]
                ))
            else:
                detail.roll_number = stu["roll_number"]
                detail.academic_year = stu["academic_year"]
                detail.section = stu["section"]

        db.commit()
        print("[OK] Student accounts seeded successfully.")

        # 4. Seed Today's Attendance Logs for Demo
        now = datetime.utcnow()
        sample_logs = [
            {"user_id": "STU-503", "role": "STUDENT", "confidence": 0.92, "mins_ago": 45},
            {"user_id": "STU-102", "role": "STUDENT", "confidence": 0.88, "mins_ago": 30},
            {"user_id": "STU-103", "role": "STUDENT", "confidence": 0.91, "mins_ago": 20},
            {"user_id": "STU-201", "role": "STUDENT", "confidence": 0.85, "mins_ago": 15},
            {"user_id": "HOD-CSE-01", "role": "HOD", "confidence": 0.95, "mins_ago": 60},
            {"user_id": "TCH-CSE-01", "role": "TEACHER", "confidence": 0.94, "mins_ago": 50},
        ]

        for log in sample_logs:
            log_time = now - timedelta(minutes=log["mins_ago"])
            existing_log = db.query(AttendanceLogModel).filter(
                AttendanceLogModel.user_id == log["user_id"]
            ).first()

            if not existing_log:
                db.add(AttendanceLogModel(
                    user_id=log["user_id"],
                    user_role=log["role"],
                    timestamp=log_time,
                    entry_type="IN",
                    confidence_score=log["confidence"],
                    device_info="WebKiosk"
                ))

        db.commit()
        print("[OK] Attendance logs seeded successfully.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
