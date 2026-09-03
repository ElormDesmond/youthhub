# Youth Register & Attendance System — Project Plan & Timeline

## 1. Executive Summary
The **Youth Register and Attendance System** is a dedicated church youth ministry management tool. Its primary goal is to empower youth leaders to rapidly enroll members, manage weekly/special event sessions, perform swift touch-optimized roll calls during live services, and analyze attendance patterns to identify youth needing pastoral follow-up.

---

## 2. Architecture & Tech Stack

```
[ Client: React + Tailwind CSS + Lucide Icons (Mobile-First Web App) ]
                              │
                      REST API (JSON)
                              │
[ Server: Node.js / Express.js REST API + SQLite / PostgreSQL driver ]
                              │
                    [ Database Layer: SQLite / PostgreSQL ]
                     ├── members
                     ├── sessions
                     └── attendance
```

### Stack Components
- **Frontend**: React (Vite-powered for rapid HMR and lightweight bundle), Tailwind CSS for responsive styling, Lucide-React icons for intuitive iconography.
- **Backend**: Node.js with Express.js, parameterized queries for high security against SQL injection, CORS-enabled for flexible deployments.
- **Database**: SQLite (default zero-configuration embedded database for fast, lightweight local deployment, with standard SQL schema compatible with PostgreSQL).

---

## 3. Detailed Milestone & Timeline Breakdown

| Milestone | Stage | Key Deliverables |
| :--- | :--- | :--- |
| **Milestone 1** | **Project Setup & Core Foundation** | • `memory.md` project memory initialization<br>• Project directory structure setup (`backend/`, `frontend/`)<br>• Environment configuration |
| **Milestone 2** | **Backend API & Database Layer** | • Database schema migration script (`members`, `sessions`, `attendance`)<br>• Seed script with realistic demo youth data & sessions<br>• REST endpoints: Members CRUD, Sessions CRUD, Attendance toggle/batch update, Reports summary & CSV stream |
| **Milestone 3** | **Frontend Core & Registration View** | • Responsive App layout with Tab Navigation (Registration, Roll Call, Reports)<br>• Mobile-optimized Member Registration Form with validation & instant feedback |
| **Milestone 4** | **Roll Call Dashboard (Live Service Mode)** | • Session Selector & New Session Creator Modal<br>• Search bar with real-time name filtering & category filters<br>• 1-tap status buttons (`Present`, `Late`, `Absent`) with optimistic UI response<br>• Live counter cards (Total, Present, Late, Absent, Attendance %)<br>• Quick actions ("Mark All Present", "Clear All") |
| **Milestone 5** | **Reports & Analytics View** | • Attendance stats overview cards<br>• Per-member attendance % breakdown with health indicators (Active, Inconsistent, At-Risk)<br>• Export to CSV utility with custom date filtering |
| **Milestone 6** | **Verification, Documentation & Launch** | • End-to-end testing across desktop and mobile screen sizes<br>• Single-command launch script (`npm run dev` / concurrently)<br>• Final documentation in `README.md` and updated `memory.md` |

---

## 4. Proposed File Structure

```
churchproject/
├── memory.md                   # Core project memory & tracking
├── PROJECT_PLAN.md             # Project blueprint & milestones
├── package.json                # Root orchestration scripts
├── backend/
│   ├── package.json
│   ├── src/
│   │   ├── server.js           # Express app entry point
│   │   ├── db/
│   │   │   ├── schema.sql      # SQL table definitions
│   │   │   ├── database.js     # DB connection & query helper
│   │   │   └── seed.js         # Sample youth members & past sessions
│   │   └── routes/
│   │       ├── members.js      # /api/members CRUD
│   │       ├── sessions.js     # /api/sessions CRUD
│   │       ├── attendance.js   # /api/attendance check-in routes
│   │       └── reports.js      # /api/reports aggregation & CSV export
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx             # Main application shell with tab switcher
        ├── components/
        │   ├── Navbar.jsx          # Header with active session indicator
        │   ├── RegistrationTab.jsx # Member enrollment form & roster
        │   ├── RollCallTab.jsx     # Live session check-in dashboard
        │   ├── ReportsTab.jsx      # Metrics, percentages & CSV export
        │   ├── SessionModal.jsx    # Quick session creator modal
        │   └── StatCards.jsx       # Real-time counter widgets
        └── services/
            └── api.js          # Centralized API service layer
```
