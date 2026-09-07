# MultiUtility Tracker — AI System Orientation & Master Architecture Guide (`ai-learn.md`)

> **Note for AI Assistant / LLM**: Read this file thoroughly before making any code modifications, API additions, database schema changes, or UI updates. This document outlines the architecture, database design, authentication rules, directory layout, design system, and operational guidelines for this codebase.

---

## 1. Executive Summary

**MultiUtility Tracker** (v1.0) is an enterprise-grade multi-tenant school & facility management ecosystem. It provides a central **Universal Module Gateway** (`/modules`) that seamlessly connects isolated, independent business modules.

### Core Evolution & Project Genesis
1. **Phase 1 — Student Attendance Tracking**: The project initially began as a standalone **Student Tracker** focused exclusively on student enrollment, kiosk-based attendance verification, and student records.
2. **Phase 2 — Faculty & Staff Attendance Expansion**: The system was then expanded to track teachers, professors, and administrative staff attendance, adding department breakdowns and class attendance audit logs.
3. **Phase 3 — MultiUtility Enterprise Ecosystem**: The scope was subsequently transformed into a modular **MultiUtility Platform**. The system was re-architected to host completely independent modules (HR & Payroll, Digital Library, Hostel & Fleet Logistics, dynamic custom modules, and a Master Admin Panel) each backed by isolated physical databases and distinct role-based authentication flows.

### Active Core Modules
1. **SMS (Module #1)**: School Management System (Students, Faculty, Departments, Live Kiosk, Attendance Logs).
2. **HR & Payroll (Module #2)**: Employee Governance, Headcount Metrics, Monthly Salary Slips, Leave Approvals.
3. **Library (Module #3)**: Digital Library, Book Catalog, Loan Ledgers, Overdue Fines.
4. **Hostel & Fleet (Module #4)**: Dorm Room Allocations, Residency Clearances, GPS Fleet Tracking.
5. **Dynamic Modules (`/[moduleId]`)**: Dynamic plugin architecture allowing custom user-defined modules.
6. **Master Admin Panel (`/admin`)**: System-wide configuration, module registry management, global user overrides.

---

## 2. Technology Stack

- **Frontend Framework**: Next.js 14 (App Router) + React 18 + TypeScript.
- **Styling & UI**: Custom Vanilla CSS Tokens + Tailwind CSS, Lucide React Icons, Glassmorphism aesthetic.
- **Backend Framework**: Python 3.10+ with FastAPI, Pydantic v2, SQLAlchemy ORM.
- **Database Engine**: SQLite with multi-database session routing (`sqlite3`).
- **Desktop Application**: PySide6 (Qt for Python) wrapper with embedded WebEngine view (`desktop/launcher.py`).

---

## 3. Database Architecture & Multi-DB Isolation

Each module operates on its **own dedicated physical SQLite database file** to ensure complete data isolation, security, zero ambiguity, and zero cross-module data leakage.

### Database File Mapping
| Database File | Module ID | Primary Entities | Key Tables |
| :--- | :--- | :--- | :--- |
| `multiutility_master.db` | `master` | Master Admins, System Settings, Module Registry | `users`, `system_modules`, `admin_logs` |
| `student_tracker.db` | `sms` | Students, Faculty, Departments, Attendance Logs | `users`, `students`, `faculty`, `departments`, `attendance_logs` |
| `module_hr.db` | `hr` | Employees, Payroll Slips, Leave Requests | `users`, `employees`, `payrolls`, `leave_requests` |
| `module_library.db` | `library` | Books, Members, Book Loans, Fine Penalties | `users`, `books`, `members`, `book_loans` |
| `module_hostel.db` | `hostel` | Hostels, Dorm Rooms, Residents, Fleet Buses | `users`, `hostels`, `rooms`, `residents`, `buses` |
| `module_<id>.db` | `<id>` | Dynamic Module Records | `users`, `records`, `logs` |

### Database Routing Mechanism (`backend/app/database.py` & `backend/app/api/auth.py`)
```python
# The backend dynamically resolves DB sessions based on target module_id:
def get_db_session(module_id: str):
    if module_id == 'sms':
        return SMS_Session()
    elif module_id == 'hr':
        return HR_Session()
    elif module_id == 'library':
        return Library_Session()
    elif module_id == 'hostel':
        return Hostel_Session()
    else:
        return Master_Session()
```

### Seeded Module Roles & Accounts
Each physical module DB contains module-specific user accounts. Common test account: `mustafa@gmail.com` (password: `password123`).
- **SMS DB**: User ID: `STU-503` | Role: `STUDENT` | Dept: `Computer Science`
- **HR DB**: User ID: `EMP-503` | Role: `HR_MANAGER` | Dept: `HR Management`
- **Library DB**: User ID: `LIB-503` | Role: `LIBRARIAN` | Dept: `Central Library`
- **Hostel DB**: User ID: `HST-503` | Role: `HOSTEL_WARDEN` | Dept: `Block A Warden`

---

## 4. Authentication & Routing Workflow

### Gateway Login vs Module Login
1. When navigating to `/<moduleId>/login` (e.g. `/hr/login`), the reusable component `ModuleLoginCard.tsx` posts to `/api/auth/login` with:
   ```json
   {
     "email": "mustafa@gmail.com",
     "password": "password123",
     "module_id": "hr"
   }
   ```
2. The backend `/api/auth/login` endpoint inspects `module_id`, connects to `module_hr.db`, verifies credentials, and returns:
   - User record (with module-specific role e.g., `HR_MANAGER`, ID `EMP-503`).
   - JWT Access Token.

### Client-Side Session Storage (`localStorage`)
- `multiutility_user`: Current logged-in user object for active module workspace.
- `multiutility_token`: Active JWT authentication token.
- `master_admin_session`: Master Admin session (provides override privileges system-wide).

### Session Security & Logout
- Logout completely purges `multiutility_user`, `multiutility_token`, `master_admin_session`, and `master_admin_token` from `localStorage`.
- Redirects to `/admin/login` if logging out from `/admin`, or `/modules` if logging out from a module workspace.

---

## 5. Frontend Architecture & Sitemap

### Key Frontend Routes
```
frontend/src/app/
├── page.tsx                     # Gateway Landing Page (redirects to /modules)
├── modules/page.tsx             # Universal Module Switcher & Gateway Hub
├── login/page.tsx               # Common Login Gateway
├── admin/
│   ├── page.tsx                 # Master Admin Dashboard
│   └── login/page.tsx           # Master Admin Security Login
├── sms/
│   ├── page.tsx                 # SMS Kiosk Workspace
│   ├── login/page.tsx           # SMS Login Gateway
│   ├── profile/page.tsx         # SMS Student / Academic Profile Page
│   ├── students/page.tsx        # Student Directory & Registration
│   ├── faculty/page.tsx         # Faculty & Staff Directory
│   ├── departments/page.tsx     # Academic Departments Management
│   ├── logs/page.tsx            # Live Attendance Audit Logs
│   └── report/page.tsx          # Class Attendance & Analytics Report
├── hr/
│   ├── page.tsx                 # HR & Payroll Workspace
│   ├── login/page.tsx           # HR Login Gateway
│   └── profile/page.tsx         # HR Employee Governance & Salary Profile
├── library/
│   ├── page.tsx                 # Digital Library Workspace
│   ├── login/page.tsx           # Library Login Gateway
│   └── profile/page.tsx         # Library Patron & Book Checkout Profile
├── hostel/
│   ├── page.tsx                 # Hostel & Fleet Workspace
│   ├── login/page.tsx           # Hostel Login Gateway
│   └── profile/page.tsx         # Hostel Residency & Gate Clearance Profile
└── [moduleId]/
    ├── page.tsx                 # Dynamic Workspace Handler for Custom Modules
    ├── login/page.tsx           # Dynamic Module Login Gateway
    └── profile/page.tsx         # Dynamic Module Profile Page
```

### Core Components (`frontend/src/components/`)
- `Navbar.tsx`: Top header navigation bar with module title, role badge, quick tabs, module switcher link (`/modules`), Master Admin link, mobile bottom navigation shelf, and My Account Profile link (`/${currentMod.id}/profile`).
- `ModuleLoginCard.tsx`: Reusable login card component with customizable module metadata, color themes, role preview tags, and default credentials pre-filling.

---

## 6. Rules & Guidelines for AI Assistants

When modifying this repository, **you must strictly adhere to the following rules**:

1. **Maintain Module Database Isolation**:
   - NEVER mix queries across physical database files.
   - When modifying backend endpoints, always ensure `get_db_session(module_id)` or the appropriate target session is used.
2. **Never Hardcode Generic Roles**:
   - Ensure role checks respect the module context (e.g., `HR_MANAGER` in HR, `LIBRARIAN` in Library, `HOSTEL_WARDEN` in Hostel, `STUDENT`/`FACULTY`/`ADMIN` in SMS).
3. **Preserve Glassmorphism & UI Design Standards**:
   - Use rich dark themes (`bg-slate-950`, `bg-dark-bg`, `glass-panel`).
   - Use curated glow gradients (indigo, purple, blue, emerald, amber) for active module states.
   - Maintain mobile and tablet responsiveness (e.g. fixed bottom shelf on mobile).
4. **Verification & Build Cleanliness**:
   - Always run `npm run build` in `frontend/` to verify zero Next.js static generation or TypeScript errors before declaring tasks complete.
5. **Git Version Control**:
   - Commit changes with descriptive messages and push to `origin/main`.

---

## 8. How to Execute & Run the System

### Option A: One-Click Smart System Launcher (Recommended)
Double click `start.bat` or run:
```bash
python launcher.py
```
**What launcher does automatically**:
1. Checks port `8000` — if inactive, starts FastAPI backend via `uvicorn backend.app.main:app --reload --port 8000`.
2. Checks port `3000` — if inactive, starts Next.js frontend via `npm run dev` in `frontend/`.
3. Auto-seeds all module databases on startup (`student_tracker.db`, `module_hr.db`, `module_library.db`, `module_hostel.db`, `multiutility_master.db`).
4. Focuses existing browser window or launches default web browser at `http://localhost:3000/`.

### Option B: Manual Execution
If launching services individually:
- **Backend Service**:
  ```bash
  python -m uvicorn backend.app.main:app --reload --port 8000
  ```
  *Backend Swagger API Docs available at*: `http://localhost:8000/docs`
- **Frontend Service**:
  ```bash
  cd frontend
  npm run dev
  ```
  *Frontend accessible at*: `http://localhost:3000/`

---

## 9. How to Work Around & Test the System

### System Key URL Endpoints
- **Universal Gateway Hub**: `http://localhost:3000/modules`
- **SMS Workspace**: `http://localhost:3000/sms` | Login: `http://localhost:3000/sms/login` | Profile: `http://localhost:3000/sms/profile`
- **HR Workspace**: `http://localhost:3000/hr` | Login: `http://localhost:3000/hr/login` | Profile: `http://localhost:3000/hr/profile`
- **Library Workspace**: `http://localhost:3000/library` | Login: `http://localhost:3000/library/login` | Profile: `http://localhost:3000/library/profile`
- **Hostel Workspace**: `http://localhost:3000/hostel` | Login: `http://localhost:3000/hostel/login` | Profile: `http://localhost:3000/hostel/profile`
- **Master Admin Panel**: `http://localhost:3000/admin` | Login: `http://localhost:3000/admin/login`

### Pre-Seeded Universal Credentials (`TEST_ACCOUNTS.txt`)
All module DBs are auto-seeded with test accounts:
- **Universal User Email**: `mustafa@gmail.com`
- **Password**: `password123`
- **Role Verification across gateways**:
  - Log into `/sms/login` -> Authenticates in `student_tracker.db` -> Role: `STUDENT` (`STU-503`).
  - Log into `/hr/login` -> Authenticates in `module_hr.db` -> Role: `HR_MANAGER` (`EMP-503`).
  - Log into `/library/login` -> Authenticates in `module_library.db` -> Role: `LIBRARIAN` (`LIB-503`).
  - Log into `/hostel/login` -> Authenticates in `module_hostel.db` -> Role: `HOSTEL_WARDEN` (`HST-503`).
- **Master Admin Credentials**:
  - Email: `admin@multiutility.com` | Password: `admin` | Role: `SUPER_ADMIN` (`ADMIN-001`).

---

## 10. Future Scope & Roadmap

1. **Finance & Fees Management Module (`/finance`)**: Fee structure setup, student fee receipts, online payment gateway simulator, penalty tracking.
2. **Exams & Grading Governance Module (`/exams`)**: Report cards, GPA calculator, exam schedule timetables, answer key archive.
3. **Admin Dynamic Module Creator**: UI interface in `/admin` allowing Super Admin to build new modules dynamically without writing code.
4. **Real-time Notifications**: WebSockets engine for instant security alerts, gate pass clearances, and payroll updates.

---

*Keep this guide updated as new modules or architectural paradigms are added to MultiUtility Tracker.*
