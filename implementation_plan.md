# Implementation Plan - Multi-Purpose Modular Utility System
## Core Module 1: SMS (School/College Management System with Biometric Attendance)

Designing a scalable, enterprise-grade **Multi-Purpose Modular Utility Platform** where **SMS (School/College Management System)** is deployed as **Module #1**. Built with a **Next.js 14+** frontend, **FastAPI (Async Python)** backend, **TiDB Cloud MySQL**, and **OpenCV Biometric Engine**, supporting both **Web Application** and **Windows Desktop Executable (`.exe`)** modes.

---

## 🏛️ Modular System Architecture & Future Scoped Enhancements

### 1. Modular Platform Concept
* **Core Platform Shell**: Central gateway featuring distinct user & admin logins, role-based navigation, and module switcher.
* **Module 1 (Current Build) — SMS (School Management System)**:
  * Real-time Biometric Face Recognition Attendance (Students, HODs, Teachers, Sub-Teachers, Staff).
  * Student & Faculty Directory with dynamic webcam registration.
  * Departmental Analytics & HOD Oversight.
  * Interactive "User Data Not Found" alert & instant 1-click registration.

### 2. Separate Admin Table & Central Admin Panel
* **Dedicated `admins` Table**: System administrators are stored in a dedicated `admins` table separate from regular institutional `users`.
* **Central Admin Portal**: Admins manage system users, configure modules, and assign module scopes (`assigned_modules_csv`).

### 3. Unified Authentication & System Run-Through Credentials
* **System-Wide Default Password**: Regular users (Students, Faculty, HODs, Staff) default to password: **`password`** for rapid testing and demonstration.
* **Admin Credentials**: Admin accounts authenticate securely via the `admins` table.

---

## ⚡ Ultra-Fast Zero-Lag Architecture (All Devices: PC & Mobile)

1. **Client-Side Adaptive Frame Compression (Browser & Mobile)**: HTML5 Canvas compresses camera frames (~25 KB JPEG at 640x480) over WebSockets.
2. **Async Non-Blocking Ring Buffer**: Server keeps a 1-frame ring buffer; drops intermediate frames during heavy processing to guarantee zero video delay.
3. **Vectorized NumPy Matrix Matching**: Pre-loads face encodings into an $(N \times 128)$ matrix for sub-20ms instant face identification across thousands of profiles.

---

## 🗄️ TiDB Database Schema (`student_tracker`) — FK-Free & Indexed

* **No Foreign Key Constraints**: Maximum performance, fast bulk inserts, zero strict relation blockages.
* **Separate Admins & Users Tables**: Clean separation between administrative super-users and regular system members.
* **Comma-Separated Columns**: Flexible denormalized fields (`assigned_modules_csv`, `subjects_csv`, `tags_csv`).
* **Optimized Indexes**: Applied on `admin_id`, `user_id`, `roll_number`, `role`, `dept_id`, `email`, and `timestamp`.

### 1. `admins` (Dedicated Admin Table)
```sql
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,           -- e.g. ADM-001
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,     -- Hashed admin password
    super_admin TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_admin_email (email)
);
```

### 2. `users` (Students, Faculty & Staff)
```sql
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,            -- e.g. STU-1001, FAC-2001
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) DEFAULT '',
    password_hash VARCHAR(255) DEFAULT '$2b$12$e868N806mQ.0Gz07Z.pL/.Vw/eP7fB2g6.wQ.0Gz07Z.pL/.Vw/eP', -- Hashed 'password'
    role VARCHAR(50) NOT NULL,                -- STUDENT, HOD, TEACHER, SUB_TEACHER, STAFF
    dept_id VARCHAR(50) DEFAULT '',
    assigned_modules_csv TEXT,                -- Comma-separated scoped modules (e.g. "SMS,ATTENDANCE,ANALYTICS")
    subjects_csv TEXT,                        -- Comma-separated subjects (e.g. "CS101,CS102")
    tags_csv TEXT,                            -- Comma-separated tags
    face_encoding LONGTEXT NOT NULL,          -- JSON 128 float array
    profile_image_url LONGTEXT,               -- Base64 or cloud URL
    is_active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_role (role),
    INDEX idx_dept_id (dept_id),
    INDEX idx_email (email)
);
```

### 3. `departments`
```sql
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dept_id VARCHAR(50) NOT NULL,
    dept_name VARCHAR(100) NOT NULL,
    hod_id VARCHAR(50) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dept_id (dept_id)
);
```

### 4. `student_details`
```sql
CREATE TABLE IF NOT EXISTS student_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    roll_number VARCHAR(50) NOT NULL,
    academic_year INT NOT NULL,
    section VARCHAR(10) DEFAULT '',
    guardian_name VARCHAR(100) DEFAULT '',
    guardian_contact VARCHAR(20) DEFAULT '',
    INDEX idx_user_id (user_id),
    INDEX idx_roll_number (roll_number)
);
```

### 5. `faculty_details`
```sql
CREATE TABLE IF NOT EXISTS faculty_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    designation VARCHAR(100) NOT NULL,        -- Associate Professor, Lecturer, etc.
    specialization VARCHAR(100) DEFAULT '',
    shift_start TIME DEFAULT '09:00:00',
    shift_end TIME DEFAULT '17:00:00',
    assigned_classes_csv TEXT,                -- e.g. "SEC-A,SEC-B"
    INDEX idx_user_id (user_id)
);
```

### 6. `attendance_logs`
```sql
CREATE TABLE IF NOT EXISTS attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    entry_type VARCHAR(20) DEFAULT 'IN',      -- IN, OUT, MARK
    confidence_score FLOAT DEFAULT 0.0,
    device_info VARCHAR(100) DEFAULT 'WebKiosk',
    INDEX idx_user_id (user_id),
    INDEX idx_user_role (user_role),
    INDEX idx_timestamp (timestamp)
);
```

---

## 📸 Dynamic Web Registration & "Unrecognized Face" Workflow

```
               ┌──────────────────────────────────────────────┐
               │  Multi-Module Shell / Login Screen           │
               │  - User Login (Default Password: 'password')  │
               │  - Admin Portal Login (via 'admins' table)   │
               └──────────────────────┬───────────────────────┘
                                      │
                                      ▼
               ┌──────────────────────────────────────────────┐
               │ Module 1: SMS & Biometric Kiosk Dashboard    │
               └──────────────────────┬───────────────────────┘
                                      │
                       ┌──────────────┴──────────────┐
                       ▼                             ▼
              [ Face Matched ]             [ Unrecognized Face ]
                       │                             │
          ┌────────────┴────────────┐      ┌─────────┴─────────┐
          │ Mark Attendance in TiDB │      │ Display UI Alert: │
          │ Show Student/Faculty UI │      │ "Data Not Found"  │
          └─────────────────────────┘      └─────────┬─────────┘
                                                     │
                                          (Click "Register Now")
                                                     │
                                           ┌─────────▼─────────┐
                                           │  Open Web Modal   │
                                           │ Pre-filled Snapshot│
                                           │ Select Role & Save│
                                           └─────────┬─────────┘
                                                     │
                                       (Auto-saves to TiDB & activates)
```

---

## 🚀 Directory Layout

```
Student-Tracker/
├── implementation_plan.md          # Persistent Root Architecture Blueprint
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py             # User & Admin Login authentication API
│   │   │   ├── attendance.py       # Biometric attendance API
│   │   │   ├── register.py         # Dynamic user & face registration
│   │   │   ├── students.py         # Student directory API
│   │   │   ├── faculty.py          # Faculty & HOD API
│   │   │   └── websocket.py        # Real-time WebSocket video stream
│   │   ├── core/
│   │   │   ├── config.py           # TiDB MySQL Credentials
│   │   │   ├── db.py               # Async SQLAlchemy / aiomysql Engine
│   │   │   ├── face_engine.py      # Vectorized NumPy face matching engine
│   │   │   └── pipeline.py         # Frame Ring Buffer
│   │   ├── models/
│   │   └── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/page.tsx      # System User & Admin Login Screen
│   │   │   ├── modules/page.tsx    # Scoped Modules Switcher Hub
│   │   │   ├── sms/                # Module 1: SMS (School Management System)
│   │   │   │   ├── page.tsx        # High-FPS Attendance Kiosk
│   │   │   │   ├── faculty/page.tsx# Faculty Directory
│   │   │   │   ├── students/page.tsx# Student Directory
│   │   │   │   ├── departments/page.tsx# HOD Department Dashboard
│   │   │   │   └── logs/page.tsx   # Real-time Log History
│   │   │   └── admin/page.tsx      # Central Admin Panel (via 'admins' table)
│   │   └── components/
│   │       ├── WebcamFeed.tsx      # Adaptive Canvas Frame Stream
│   │       ├── UnrecognizedAlertCard.tsx # "Data Not Found - Register Now" pop-up
│   │       ├── RegisterUserModal.tsx   # 1-Click Registration Modal
│   │       └── UserCard.tsx
│   └── package.json
│
└── desktop/                        # Standalone Desktop Executable (.exe) Launcher
    ├── launcher.py
    └── build_exe.py
```

---

## 🧪 Verification Plan

### Automated Verification
1. **Root Plan Persistence Check**: Verify `implementation_plan.md` is updated in artifact storage and workspace root (`c:\Personal\Projects & Codes\Student-Tracker\implementation_plan.md`).
2. **TiDB Cloud Schema Setup**: Execute async Python script creating separate `admins` and `users` tables (indexed, FK-free) on TiDB Cloud MySQL.
3. **NumPy Vectorization Speed Test**: Benchmark 1,000 face distance calculations in memory (< 5 milliseconds execution time).

### Manual Verification
1. **Admin vs User Login Test**: Authenticate via Admin portal using `admins` table vs regular user login using `users` table.
2. **Low-Latency Camera Recognition**: Test video stream on PC and Mobile browser to verify zero lag.
3. **Unrecognized Face Alert & 1-Click Registration**: Verify unknown face triggers **"Data Not Found"** prompt and immediate snapshot registration.
4. **Desktop EXE Launcher Test**: Verify single `.exe` script launches both backend service and desktop interface window.
