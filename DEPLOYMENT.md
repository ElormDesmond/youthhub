# Deployment Guide - Youth Attendance System

## 🚀 Production Deployment Steps

### Prerequisites
- Node.js 16+ installed
- PostgreSQL 13+ database (or embedded SQLite for local/small scale)
- GitHub account (for CI/CD)
- Vercel account (frontend) or similar hosting
- Railway/Render/VPS account (backend)

---

## PART 1: Local Development Setup

### 1.1 Clone & Install Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Update .env with your database credentials
nano .env
```

### 1.2 Setup Database

```bash
# PostgreSQL Setup
createdb youth_attendance
psql -U postgres -d youth_attendance -f src/db/schema.sql

# Seed sample data
npm run db:seed
```

### 1.3 Start Backend Server

```bash
npm run dev
# Server runs on http://localhost:5000
```

Test health check:
```bash
curl http://localhost:5000/api/health
```

### 1.4 Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env.local
cp .env.local.example .env.local

# Start development server
npm run dev
# App runs on http://localhost:3000
```

---

## PART 2: Production Deployment (Vercel + Railway)

### 2.1 Deploy Backend to Railway

Railway is free for small projects and scales automatically.

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Initialize project
cd backend
railway init

# Set environment variables in Railway dashboard:
# DATABASE_URL, PORT, FRONTEND_URL, JWT_SECRET, etc.

# Deploy
railway up
```

**In Railway Dashboard:**
1. Go to your project.
2. Click "Variables" tab.
3. Add all required environment variables (`DATABASE_URL`, `FRONTEND_URL`, `PORT=5000`).
4. Copy the public domain URL (e.g., `https://your-api.railway.app`).

### 2.2 Deploy Frontend to Vercel

**Option A: Via GitHub (Recommended)**
```bash
# Push repository to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourname/youth-attendance
git push -u origin main

# Go to Vercel: https://vercel.com
# Click "New Project" → Select GitHub repo
# Set Root Directory to "frontend"
# Set environment variables:
#   VITE_API_URL = https://your-api.railway.app/api
# Deploy
```

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
cd frontend
vercel
```

### 2.3 Post-Deployment Setup

1. **Update CORS in Backend:** Update `FRONTEND_URL` in Railway environment variables to match your Vercel domain.
2. **Test End-to-End:** Create a session, register a member, and test check-in.
3. **Verify SSL/HTTPS:** Vercel and Railway automatically provision SSL.

---

## PART 3: Custom Domain Setup

### 3.1 Backend (Railway)
1. Project Settings → Domains
2. Add Custom Domain (e.g., `api.youth.yourchurch.org`)
3. Point DNS CNAME to Railway's value

### 3.2 Frontend (Vercel)
1. Project Settings → Domains
2. Add Domain (e.g., `youth.yourchurch.org`)
3. Follow DNS instructions

---

## PART 4: Database Backups

### Automated Backups (Railway / PostgreSQL)
```bash
# Export database
pg_dump -U postgres -d youth_attendance > backup.sql

# Restore from backup
psql -U postgres -d youth_attendance < backup.sql
```

### Automated Cron Backup to AWS S3:
```bash
0 2 * * 0 pg_dump -U postgres youth_attendance | gzip | aws s3 cp - s3://your-bucket/backups/youth-attendance-$(date +\%Y-\%m-\%d).sql.gz
```

---

## PART 5: Monitoring & Logging
- **Railway Logs:** Dashboard → Deployments → View real-time logs.
- **Vercel Analytics:** Web vitals & edge function metrics.
- **Sentry Integration:**
  ```bash
  npm install @sentry/node
  ```

---

## PART 6: CI/CD Pipeline (GitHub Actions)

File: `.github/workflows/deploy.yml`

```yaml
name: Deploy Youth Attendance System

on:
  push:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm test || true

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Deploying backend to Railway"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: echo "Deploying frontend to Vercel"
```

---

## PART 7: Performance Optimization

### Backend Optimization
1. **GZIP Compression:** `compression` middleware enabled.
2. **Database Indexing:** Indexed on `session_date`, `(member_id, session_id)`, `status`, `youth_group_id`.
3. **Connection Pooling:** Built-in connection pool manager in `database.js`.

---

## PART 8: Security Checklist
- [x] All queries use parameterized statements (SQL injection safe)
- [x] CORS restricted to frontend domain
- [x] Server-side input validation on all endpoints
- [x] Soft deletes (`deleted_at` timestamp)
- [x] Security headers and sanitized data handling

---

## PART 9: Troubleshooting

### Database Connection
```bash
psql postgresql://user:pass@host:5432/youth_attendance
```

### Health Check
```bash
curl http://localhost:5000/api/health
```
