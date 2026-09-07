# MultiUtility Tracker — System Dataflow & Database Architecture Diagrams (`dataflow-diagram.md`)

This document provides visual diagrams and architectural flowcharts illustrating the database design, API routing resolution, authentication security lifecycle, client-side session management, and system execution flow of **MultiUtility Tracker**.

---

## 1. High-Level Architecture Overview

```mermaid
graph TD
    Client["💻 Client Interface<br/>(Web Browser / PySide Desktop Launcher)"]
    
    subgraph Frontend["Next.js 14 App Router (Port 3000)"]
        Gateway["Universal Gateway<br/>/modules"]
        Navbar["Global Navbar & Shelf<br/>(Navbar.tsx)"]
        LoginCard["Module Login Component<br/>(ModuleLoginCard.tsx)"]
        Workspaces["Module Workspaces<br/>/sms, /hr, /library, /hostel, /[moduleId]"]
        ProfilePages["Module Profile Pages<br/>/<moduleId>/profile"]
    end
    
    subgraph Backend["FastAPI REST Backend (Port 8000)"]
        AuthAPI["/api/auth Router<br/>(auth.py)"]
        DBDispatcher["Session Dispatcher<br/>get_db_session(module_id)"]
        AdminAPI["/api/admin Router<br/>(admin.py)"]
    end
    
    subgraph DatabaseLayer["Physical Database Layer (SQLite)"]
        MasterDB[("multiutility_master.db<br/>(System Modules & Admin)")]
        SMSDB[("student_tracker.db<br/>(SMS Module #1)")]
        HRDB[("module_hr.db<br/>(HR Module #2)")]
        LibDB[("module_library.db<br/>(Library Module #3)")]
        HostelDB[("module_hostel.db<br/>(Hostel Module #4)")]
        CustomDB[("module_<id>.db<br/>(Dynamic Plugin Modules)")]
    end
    
    Client --> Gateway
    Gateway --> Workspaces
    Workspaces --> LoginCard
    LoginCard --> AuthAPI
    Navbar --> ProfilePages
    
    AuthAPI --> DBDispatcher
    AdminAPI --> MasterDB
    
    DBDispatcher -->|module_id = 'sms'| SMSDB
    DBDispatcher -->|module_id = 'hr'| HRDB
    DBDispatcher -->|module_id = 'library'| LibDB
    DBDispatcher -->|module_id = 'hostel'| HostelDB
    DBDispatcher -->|module_id = 'master'| MasterDB
    DBDispatcher -->|module_id = custom| CustomDB
```

---

## 2. Multi-Database Isolation & Schema Entity Flow

Each module accesses its own physical SQLite database to ensure total data segregation.

```mermaid
erDiagram
    MASTER_DB_USERS ||--o{ SYSTEM_MODULES : registers
    MASTER_DB_USERS {
        string user_id PK
        string email
        string hashed_password
        string role "SUPER_ADMIN"
    }

    SMS_USERS ||--o{ STUDENTS : contains
    SMS_USERS ||--o{ FACULTY : contains
    SMS_USERS {
        string user_id PK "STU-503"
        string email "mustafa@gmail.com"
        string role "STUDENT"
        string dept_id "Computer Science"
    }

    HR_USERS ||--o{ EMPLOYEES : tracks
    HR_USERS ||--o{ PAYROLLS : generates
    HR_USERS {
        string user_id PK "EMP-503"
        string email "mustafa@gmail.com"
        string role "HR_MANAGER"
        string dept_id "HR Management"
    }

    LIB_USERS ||--o{ BOOK_LOANS : issues
    LIB_USERS {
        string user_id PK "LIB-503"
        string email "mustafa@gmail.com"
        string role "LIBRARIAN"
        string dept_id "Central Library"
    }

    HST_USERS ||--o{ RESIDENTS : manages
    HST_USERS {
        string user_id PK "HST-503"
        string email "mustafa@gmail.com"
        string role "HOSTEL_WARDEN"
        string dept_id "Block A Warden"
    }
```

---

## 3. Authentication & Target DB Routing Sequence

Sequence flow showing how a user logging into a gateway (e.g., HR) gets routed to the exact database file without colliding with other modules.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Browser
    participant UI as ModuleLoginCard
    participant API as Backend FastAPI (/api/auth/login)
    participant Router as Session Dispatcher (get_db_session)
    participant TargetDB as Physical SQLite DB (e.g. module_hr.db)
    
    User->>UI: Selects module gateway (/hr/login) & inputs credentials
    UI->>API: POST /api/auth/login { email, password, module_id: "hr" }
    API->>Router: get_db_session("hr")
    Router->>TargetDB: Connect to engine("sqlite:///module_hr.db")
    TargetDB-->>Router: DB Session Connected
    API->>TargetDB: SELECT * FROM users WHERE email = 'mustafa@gmail.com'
    TargetDB-->>API: Returns HR User record (user_id: "EMP-503", role: "HR_MANAGER")
    API->>API: Verify Password Hash & Generate JWT Token
    API-->>UI: 200 OK Response { access_token, user: { user_id, name, role: "HR_MANAGER", active_module: "hr" } }
    UI->>User: Save to localStorage("multiutility_user") & Redirect to /hr
```

---

## 4. Client-Side Session Lifecycle & Navbar Resolution

Flowchart detailing local session management, active workspace detection, and profile link calculation.

```mermaid
flowchart TD
    Start["User Opens Page"] --> PathCheck{"Check Pathname"}
    
    PathCheck -->|"/admin/*"| HideNavbar["Suppress Standard Navbar"]
    PathCheck -->|"/modules" or "/"| GatewayState["Render Universal Gateway Hub"]
    PathCheck -->|"/<moduleId>/*"| ModuleState["Resolve Active Module ID (e.g., hr, library, hostel, sms)"]
    
    ModuleState --> UserCheck{"Check localStorage"}
    UserCheck -->|master_admin_session exists| AdminOverride["Set Current User = Master Admin (SUPER_ADMIN)"]
    UserCheck -->|multiutility_user exists| ModuleUser["Set Current User = Module User (e.g., HR_MANAGER)"]
    UserCheck -->|None exists| GuestUser["Show Unauthenticated Gateway State"]
    
    ModuleUser --> NavRender["Render Dynamic Navbar (Navbar.tsx)"]
    NavRender --> ProfileCalc["Calculate Profile Link: currentMod.id != 'gateway' ? /<moduleId>/profile : /sms/profile"]
    
    ProfileCalc --> ClickProfile{"User Clicks 'My Account Profile'"}
    ClickProfile --> ProfileNav["Navigate to /<currentModule>/profile"]
    
    NavRender --> ClickLogout{"User Clicks 'Logout Session'"}
    ClickLogout --> PurgeSession["Purge multiutility_user, multiutility_token, master_admin_session"]
    PurgeSession --> RedirectGateway["Redirect Window to /modules"]
```

---

## 5. Page Sitemap & Component Navigation Hierarchy

```mermaid
graph LR
    Root["/ (Landing Redirect)"] --> Modules["/modules (Universal Gateway Hub)"]
    
    Modules --> SMS["/sms (SMS Workspace)"]
    SMS --> SMSLogin["/sms/login"]
    SMS --> SMSProfile["/sms/profile"]
    SMS --> SMSStudents["/sms/students"]
    SMS --> SMSFaculty["/sms/faculty"]
    SMS --> SMSDepts["/sms/departments"]
    SMS --> SMSLogs["/sms/logs"]
    SMS --> SMSReport["/sms/report"]
    
    Modules --> HR["/hr (HR Workspace)"]
    HR --> HRLogin["/hr/login"]
    HR --> HRProfile["/hr/profile"]
    
    Modules --> Library["/library (Library Workspace)"]
    Library --> LibLogin["/library/login"]
    Library --> LibProfile["/library/profile"]
    
    Modules --> Hostel["/hostel (Hostel Workspace)"]
    Hostel --> HostelLogin["/hostel/login"]
    Hostel --> HostelProfile["/hostel/profile"]
    
    Modules --> Dynamic["/[moduleId] (Custom Dynamic Workspace)"]
    Dynamic --> DynLogin["/[moduleId]/login"]
    Dynamic --> DynProfile["/[moduleId]/profile"]
    
    Modules --> Admin["/admin (Master Admin Panel)"]
    Admin --> AdminLogin["/admin/login"]
```

---

## 6. One-Click System Launcher Execution Flow (`launcher.py`)

```mermaid
flowchart TD
    Launch["Run python launcher.py or start.bat"] --> Port8000{"Check Port 8000 (Backend)"}
    
    Port8000 -->|Inactive| StartBackend["Spawn Subprocess: uvicorn backend.app.main:app --reload --port 8000"]
    Port8000 -->|Active| ReuseBackend["Reuse Running FastAPI Service"]
    
    StartBackend --> SeedCheck["Run Startup DB Auto-Seeding (main.py)"]
    ReuseBackend --> Port3000{"Check Port 3000 (Frontend)"}
    SeedCheck --> Port3000
    
    Port3000 -->|Inactive| StartFrontend["Spawn Subprocess: npm run dev in frontend/"]
    Port3000 -->|Active| ReuseFrontend["Reuse Running Next.js Service"]
    
    StartFrontend --> WaitServices["Wait 3s for Initialization"]
    ReuseFrontend --> LaunchBrowser["Execute focus_or_open_browser('http://localhost:3000/')"]
    WaitServices --> LaunchBrowser
    
    LaunchBrowser --> PowerShellFocus{"Attempt PowerShell AppActivate & Hard Refresh"}
    PowerShellFocus -->|Found Existing Tab| SendRefresh["Send Ctrl+Shift+R / Ctrl+F5 (Hard Cache Refresh)"]
    PowerShellFocus -->|No Window Found| OpenBrowser["Open Default Web Browser at http://localhost:3000/"]
    
    SendRefresh --> LiveState["System Live & Interactive"]
    OpenBrowser --> LiveState
```

---

*Keep this dataflow document synced with any architectural modifications or new diagram requirements.*
