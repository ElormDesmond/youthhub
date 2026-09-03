# Youth Register & Attendance System - Complete Setup Guide

## 📁 Project Structure

```
youth-attendance-system/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── seed.sql
│   │   ├── routes/
│   │   │   ├── members.js
│   │   │   ├── sessions.js
│   │   │   ├── attendance.js
│   │   │   └── reports.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── controllers/
│   │   │   ├── memberController.js
│   │   │   ├── sessionController.js
│   │   │   ├── attendanceController.js
│   │   │   └── reportController.js
│   │   └── app.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CheckInDashboard.jsx
│   │   │   ├── RegistrationForm.jsx
│   │   │   ├── ReportsTab.jsx
│   │   │   ├── MemberCard.jsx
│   │   │   ├── SessionSelector.jsx
│   │   │   └── Navbar.jsx
│   │   ├── pages/
│   │   │   ├── index.jsx
│   │   │   ├── register.jsx
│   │   │   ├── checkin.jsx
│   │   │   └── reports.jsx
│   │   ├── hooks/
│   │   │   ├── useAttendance.js
│   │   │   ├── useMembers.js
│   │   │   └── useSessions.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── api/
│   │       └── client.js
│   ├── .env.local.example
│   ├── package.json
│   ├── next.config.js
│   └── tailwind.config.js
├── docker-compose.yml
├── README.md
├── DEPLOYMENT.md
├── PROJECT_PLAN.md
└── memory.md
```

## 🚀 Development Timeline

### Phase 1: Foundation (Days 1-3)
- [ ] Set up Node.js + Express / Next.js project structure
- [ ] Initialize PostgreSQL / SQLite database with schema and seed data
- [ ] Create basic Express API endpoints & middleware (`auth.js`, CORS, error handling)

### Phase 2: Core Features (Days 4-7)
- [ ] Implement member registration API + form with guardian info & youth groups
- [ ] Build session management (creation, listing, summaries)
- [ ] Create attendance check-in logic (touch toggle: present, absent, late, excused)
- [ ] Build responsive dashboard UI with live statistics and circular progress

### Phase 3: Enhancement (Days 8-10)
- [ ] Reports and analytics (attendance % per member and session)
- [ ] Search, instant name/phone filtering, and group categorization
- [ ] Mobile optimization (44px touch targets, single-tap workflows)
- [ ] CSV export functionality

### Phase 4: Polish & Deploy (Days 11-14)
- [ ] Automated end-to-end testing
- [ ] UI/UX refinements & accessibility (WCAG 2.1 AA)
- [ ] Documentation and production deployment config (Vercel + Railway + Docker)

## 💻 Tech Stack Rationale

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | Next.js / React + Tailwind CSS | Fast loads, responsive design, excellent mobile touch support |
| **Styling** | Tailwind CSS | Rapid development, mobile-first, clean utility classes |
| **Backend** | Node.js + Express | JavaScript throughout, lightweight, robust REST APIs |
| **Database** | PostgreSQL / SQLite | ACID compliance, relational integrity, parameterized safety |
| **State** | React Hooks + API Client | Simple, reactive, no unnecessary boilerplate |
| **Deployment** | Vercel (frontend) + Railway / VPS (backend) | Auto-scaling, SSL, container-ready |

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "pg": "^8.10.0",
  "better-sqlite3": "^9.4.0",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "jwt-simple": "^0.5.6",
  "bcryptjs": "^2.4.3"
}
```

### Frontend
```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "tailwindcss": "^3.3.0",
  "axios": "^1.5.0",
  "lucide-react": "^0.294.0"
}
```

## 🔐 Security Checklist
- [x] Use environment variables for secrets (never commit raw credentials)
- [x] Hash passwords with bcrypt
- [x] Validate all API inputs server-side
- [x] Use HTTPS in production
- [x] Add CORS restrictions
- [x] Use prepared statements to prevent SQL injection
- [x] Sanitize user input and enforce soft deletes
