-- Global Evangelical Church Youth (Kasoa Branch) - Database Schema
-- Enhanced with MoMo Payments, Dynamic Sunday Services, Automated Reminders, Batch Member Import & Visual Analytics

-- Roles/Permissions table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'admin', 'media_team', 'records_officer', 'volunteer', 'viewer'
    display_name VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users/Staff/Executives table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    title VARCHAR(100), -- e.g. "Head of Media", "Attendance Secretary", "Lead Pastor"
    role_id INT REFERENCES roles(id) DEFAULT 5,
    permissions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Youth Groups/Classes
CREATE TABLE IF NOT EXISTS youth_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL, -- 'Junior Youth', 'Teen Leaders', 'Young Adults'
    age_min INT,
    age_max INT,
    leader_id INT REFERENCES users(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table (Youth Directory)
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(20),
    guardian_name VARCHAR(100),
    guardian_phone VARCHAR(20),
    guardian_email VARCHAR(100),
    youth_group_id INT REFERENCES youth_groups(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    enrollment_date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT unique_member UNIQUE (first_name, last_name, date_of_birth)
);

-- Sessions & Yearly Event Timeline table
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    session_time TIME,
    location VARCHAR(100),
    session_type VARCHAR(50) DEFAULT 'meeting', -- 'meeting', 'event', 'camp', 'trip', 'outreach', 'worship_night'
    banner_url TEXT,
    youth_group_id INT REFERENCES youth_groups(id) ON DELETE SET NULL,
    created_by INT REFERENCES users(id) ON DELETE SET NULL,
    expected_attendance INT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    member_id INT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    session_id INT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'awaiting', -- 'present', 'absent', 'late', 'excused', 'awaiting'
    check_in_time TIMESTAMP,
    notes TEXT,
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_attendance UNIQUE (member_id, session_id)
);

-- Attendance History (Audit trail)
CREATE TABLE IF NOT EXISTS attendance_history (
    id SERIAL PRIMARY KEY,
    attendance_id INT REFERENCES attendance(id) ON DELETE CASCADE,
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    changed_by INT REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sunday Services & Order of Worship Config
CREATE TABLE IF NOT EXISTS sunday_services (
    id SERIAL PRIMARY KEY,
    service_date DATE NOT NULL,
    service_mode VARCHAR(50) DEFAULT 'two_services', -- 'two_services', 'joint_service'
    first_service_title VARCHAR(100) DEFAULT '1st Morning Worship Service',
    first_service_time VARCHAR(50) DEFAULT '7:00 AM - 9:00 AM',
    second_service_title VARCHAR(100) DEFAULT '2nd Empowerment Service',
    second_service_time VARCHAR(50) DEFAULT '9:30 AM - 12:00 PM',
    joint_service_title VARCHAR(100) DEFAULT 'Joint Covenant Service',
    joint_service_time VARCHAR(50) DEFAULT '8:00 AM - 11:30 AM',
    is_communion_sunday BOOLEAN DEFAULT FALSE,
    service_theme VARCHAR(200) DEFAULT 'Walking in Divine Purpose & Excellence',
    scripture_reading VARCHAR(100) DEFAULT '1 Timothy 4:12',
    announcements_note TEXT,
    updated_by INT REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MoMo & Digital Payments (Hubtel Ready Placeholder)
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    payer_name VARCHAR(100) NOT NULL,
    payer_phone VARCHAR(25) NOT NULL,
    network VARCHAR(50) DEFAULT 'MTN', -- 'MTN', 'Telecel' (Vodafone), 'AT' (AirtelTigo), 'Card'
    category VARCHAR(50) DEFAULT 'dues', -- 'dues', 'levy', 'fundraising', 'offering'
    campaign_title VARCHAR(150) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'GHS',
    reference VARCHAR(100),
    transaction_id VARCHAR(100) UNIQUE,
    status VARCHAR(30) DEFAULT 'successful', -- 'successful', 'pending', 'failed'
    hubtel_client_ref VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Automated Notification & Reminder Schedules
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    reminder_type VARCHAR(50) NOT NULL, -- 'monday_tuesday_meeting', 'tuesday_5pm_alert', 'event_week_prior', 'event_3days_prior', 'event_morning', 'saturday_6pm_service', 'sunday_morning'
    target_date DATE,
    target_time TIME,
    channel VARCHAR(50) DEFAULT 'all', -- 'in_app', 'sms_hubtel', 'whatsapp', 'all'
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media Gallery (Photos, Videos, Banners)
CREATE TABLE IF NOT EXISTS gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    media_type VARCHAR(20) DEFAULT 'image', -- 'image' | 'video'
    media_url TEXT NOT NULL,
    video_embed_url TEXT,
    tags VARCHAR(100) DEFAULT 'Youth Life',
    event_date DATE DEFAULT CURRENT_DATE,
    uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dues & Levies Campaigns
CREATE TABLE IF NOT EXISTS dues_and_levies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'monthly_dues', -- 'monthly_dues', 'camp_levy', 'fundraising', 'tshirt_levy'
    amount_target DECIMAL(10,2) DEFAULT 0.00,
    amount_collected DECIMAL(10,2) DEFAULT 0.00,
    amount_disbursed DECIMAL(10,2) DEFAULT 0.00,
    purpose TEXT,
    period VARCHAR(50),
    status VARCHAR(20) DEFAULT 'open',
    recorded_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Announcements, News & Weekly Devotionals
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'announcement',
    image_url TEXT,
    video_url TEXT,
    youth_group_id INT REFERENCES youth_groups(id) ON DELETE SET NULL,
    posted_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Supervisor Comments
CREATE TABLE IF NOT EXISTS supervisor_comments (
    id SERIAL PRIMARY KEY,
    portal_section VARCHAR(50) NOT NULL,
    target_id INT,
    admin_id INT REFERENCES users(id) ON DELETE SET NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_members_group ON members(youth_group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_category ON payments(category);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(created_at);
