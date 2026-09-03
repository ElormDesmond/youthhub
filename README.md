# Youth Register & Attendance System 📋✓

A **modern, mobile-first application** for church youth ministry to manage member registration, track attendance, and generate reports.

**Perfect for:** Church youth groups, Sunday schools, youth programs, mission trips, events tracking.

---

## ✨ Key Features

### Core Functionality
✅ **Quick Check-In** - One-tap attendance recording during sessions  
✅ **Member Registry** - Complete member profiles with guardian info  
✅ **Session Management** - Create events/meetings and group them by youth group  
✅ **Attendance Tracking** - Mark present, absent, late, excused status  
✅ **Reports & Analytics** - View attendance trends, percentage calculations  
✅ **Mobile Optimized** - Full-screen responsive design for phones/tablets  

### Advanced Features
🔍 **Smart Search** - Find members by name or phone instantly  
👥 **Group Management** - Organize youth into groups (Juniors, Teens, Young Adults)  
📊 **Analytics Dashboard** - Monthly trends, engagement scoring  
🔔 **Guardian Notifications** - SMS/email alerts for absences (future feature)  
🔐 **Role-Based Access** - Admin, volunteer, viewer permissions  
📱 **Progressive Web App** - Works offline with service workers (future feature)  

---

## 🛠️ Tech Stack

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend** | React / Next.js + Tailwind CSS + Lucide Icons | Fast, responsive, excellent mobile touch support |
| **Backend** | Node.js + Express.js | Simple, JavaScript throughout, robust REST APIs |
| **Database** | PostgreSQL / SQLite (dual support) | Robust, ACID-compliant, relational integrity |
| **Hosting** | Vercel (Frontend) + Railway / VPS (Backend) | Easy deployment, auto-scaling, container-ready |
| **Styling** | Tailwind CSS | Utility-first, mobile-first, rapid UI iteration |

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Node.js 16+
- PostgreSQL 13+ or SQLite (embedded)
- Git

### 1️⃣ Clone & Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
# ✅ Server running on http://localhost:5000
```

### 2️⃣ Initialize Database & Seed
```bash
# PostgreSQL or SQLite automatic migration & seed script
npm run db:init
npm run db:seed
```

### 3️⃣ Setup & Run Frontend
```bash
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
# ✅ App running on http://localhost:3001
```

---

## 📁 Project Structure

```
churchproject/
├── memory.md                       # Core project memory & tracking
├── PROJECT_PLAN.md                 # Project roadmap & milestones
├── IMPLEMENTATION_SUMMARY.md       # Architecture summary
├── README.md                       # Documentation & usage
├── docker-compose.yml              # Multi-container orchestration
├── DEPLOYMENT.md                   # Production deployment guide
├── SETUP_GUIDE.md                  # Development environment guide
│
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql          # PostgreSQL & SQLite compatible schema
│   │   │   ├── database.js         # Connection pool & query abstraction
│   │   │   └── seed.js             # Demo data generator
│   │   ├── controllers/
│   │   │   ├── memberController.js     # Member CRUD & filtering
│   │   │   ├── sessionController.js    # Session management & summaries
│   │   │   ├── attendanceController.js # One-tap & bulk check-ins
│   │   │   └── reportController.js     # Metrics & CSV exports
│   │   ├── routes/
│   │   │   ├── routes_members.js
│   │   │   ├── routes_sessions.js
│   │   │   ├── routes_attendance.js
│   │   │   └── routes_reports.js
│   │   └── server.js               # Express application entry
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CheckInDashboard.jsx  # Live stats, circular progress & roster
    │   │   ├── MemberCard.jsx        # Touch card with status buttons
    │   │   ├── SessionSelector.jsx   # Date picker & session creator modal
    │   │   ├── RegistrationForm.jsx  # Member enrollment form
    │   │   ├── ReportsTab.jsx        # Attendance % & CSV export
    │   │   └── Navbar.jsx            # Top navigation & session indicator
    │   ├── hooks/
    │   │   ├── useAttendance.js      # Optimistic check-in hooks
    │   │   ├── useMembers.js         # Member data & search hook
    │   │   └── useSessions.js        # Session management hook
    │   ├── services/
    │   │   └── api_client.js         # Axios API client
    │   └── App.jsx                   # Main layout container
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── .env.local.example
```

---

## 🔌 API Endpoints Summary

### Members (`/api/members`)
- `GET /api/members` - List all members (filters: search, group_id, status)
- `POST /api/members` - Register new member
- `GET /api/members/:id` - Member profile & history
- `PUT /api/members/:id` - Update member profile
- `DELETE /api/members/:id` - Soft deactivate member
- `GET /api/members/groups/list` - List all youth groups

### Sessions (`/api/sessions`)
- `GET /api/sessions` - List scheduled sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session details
- `PUT /api/sessions/:id` - Update session
- `DELETE /api/sessions/:id` - Delete session
- `GET /api/sessions/:id/summary` - Get attendance summary for session

### Attendance (`/api/attendance`)
- `GET /api/attendance/session/:sessionId` - Get all attendance for a session
- `POST /api/attendance` - Record/toggle attendance (present, absent, late, excused)
- `PUT /api/attendance/:member_id/:session_id` - Update status
- `GET /api/attendance/member/:memberId` - Member attendance history
- `POST /api/attendance/bulk` - Bulk mark all present or import

### Reports (`/api/reports`)
- `GET /api/reports/attendance-by-member` - Individual member statistics & percentages
- `GET /api/reports/attendance-by-session` - Session-by-session trends
- `GET /api/reports/group-summary` - Youth group overview
- `GET /api/reports/export-csv` - Downloadable CSV attendance export

---

## 📄 License
MIT License. Built with ❤️ for church youth ministries.
