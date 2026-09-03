const fs = require('fs');
const path = require('path');
const db = require('./database');

async function initDb() {
    console.log('🚀 Initializing Global Evangelical Church Youth Database Schema...');
    try {
        if (db.getDriver() === 'pg') {
            const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
            await db.query(schemaSql);
        } else {
            const sqliteSchema = [
                `CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    display_name TEXT,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    username TEXT UNIQUE,
                    password_hash TEXT NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    title TEXT,
                    role_id INTEGER REFERENCES roles(id) DEFAULT 5,
                    permissions TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS youth_groups (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    age_min INTEGER,
                    age_max INTEGER,
                    leader_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    description TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    email TEXT,
                    phone_number TEXT,
                    date_of_birth DATE,
                    gender TEXT,
                    guardian_name TEXT,
                    guardian_phone TEXT,
                    guardian_email TEXT,
                    youth_group_id INTEGER REFERENCES youth_groups(id) ON DELETE SET NULL,
                    status TEXT DEFAULT 'active',
                    enrollment_date DATE DEFAULT (date('now')),
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    deleted_at DATETIME,
                    CONSTRAINT unique_member UNIQUE (first_name, last_name, date_of_birth)
                )`,
                `CREATE TABLE IF NOT EXISTS sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    session_date DATE NOT NULL,
                    session_time TIME,
                    location TEXT,
                    session_type TEXT DEFAULT 'meeting',
                    banner_url TEXT,
                    youth_group_id INTEGER REFERENCES youth_groups(id) ON DELETE SET NULL,
                    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    expected_attendance INTEGER,
                    is_featured INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS attendance (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
                    session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
                    status TEXT DEFAULT 'awaiting',
                    check_in_time DATETIME,
                    notes TEXT,
                    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT unique_attendance UNIQUE (member_id, session_id)
                )`,
                `CREATE TABLE IF NOT EXISTS attendance_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    attendance_id INTEGER REFERENCES attendance(id) ON DELETE CASCADE,
                    old_status TEXT,
                    new_status TEXT,
                    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS sunday_services (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    service_date DATE NOT NULL,
                    service_mode TEXT DEFAULT 'two_services',
                    first_service_title TEXT DEFAULT '1st Morning Worship Service',
                    first_service_time TEXT DEFAULT '7:00 AM - 9:00 AM',
                    second_service_title TEXT DEFAULT '2nd Empowerment Service',
                    second_service_time TEXT DEFAULT '9:30 AM - 12:00 PM',
                    joint_service_title TEXT DEFAULT 'Joint Covenant Service',
                    joint_service_time TEXT DEFAULT '8:00 AM - 11:30 AM',
                    is_communion_sunday INTEGER DEFAULT 0,
                    service_theme TEXT DEFAULT 'Walking in Divine Purpose & Excellence',
                    scripture_reading TEXT DEFAULT '1 Timothy 4:12',
                    announcements_note TEXT,
                    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS payments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    payer_name TEXT NOT NULL,
                    payer_phone TEXT NOT NULL,
                    network TEXT DEFAULT 'MTN',
                    category TEXT DEFAULT 'dues',
                    campaign_title TEXT NOT NULL,
                    amount REAL NOT NULL,
                    currency TEXT DEFAULT 'GHS',
                    reference TEXT,
                    transaction_id TEXT UNIQUE,
                    status TEXT DEFAULT 'successful',
                    hubtel_client_ref TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    reminder_type TEXT NOT NULL,
                    target_date DATE,
                    target_time TIME,
                    channel TEXT DEFAULT 'all',
                    is_sent INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS gallery (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    media_type TEXT DEFAULT 'image',
                    media_url TEXT NOT NULL,
                    video_embed_url TEXT,
                    tags TEXT DEFAULT 'Youth Life',
                    event_date DATE DEFAULT (date('now')),
                    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS dues_and_levies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT DEFAULT 'monthly_dues',
                    amount_target REAL DEFAULT 0.0,
                    amount_collected REAL DEFAULT 0.0,
                    amount_disbursed REAL DEFAULT 0.0,
                    purpose TEXT,
                    period TEXT,
                    status TEXT DEFAULT 'open',
                    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS announcements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    content TEXT NOT NULL,
                    category TEXT DEFAULT 'announcement',
                    image_url TEXT,
                    video_url TEXT,
                    youth_group_id INTEGER REFERENCES youth_groups(id) ON DELETE SET NULL,
                    posted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE TABLE IF NOT EXISTS supervisor_comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    portal_section TEXT NOT NULL,
                    target_id INTEGER,
                    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                    comment_text TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                `CREATE INDEX IF NOT EXISTS idx_members_group ON members(youth_group_id)`,
                `CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date)`,
                `CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id)`,
                `CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id)`,
                `CREATE INDEX IF NOT EXISTS idx_payments_category ON payments(category)`
            ];

            for (const stmt of sqliteSchema) {
                try {
                    await db.query(stmt);
                } catch (e) {
                    console.warn('Init notice:', e.message);
                }
            }
            try {
                await db.query('ALTER TABLE users ADD COLUMN username TEXT;');
            } catch (e) {}
        }
        console.log('✅ Global Evangelical Church Youth Schema initialized successfully!');
    } catch (err) {
        console.error('❌ Schema initialization error:', err);
    }
}

if (require.main === module) {
    initDb().then(() => process.exit(0));
}

module.exports = initDb;
