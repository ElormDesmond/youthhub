-- Initial Seed Data for Youth Register & Attendance System

-- Insert Roles
INSERT INTO roles (id, name) VALUES 
    (1, 'admin'),
    (2, 'volunteer'),
    (3, 'viewer')
ON CONFLICT (id) DO NOTHING;

-- Insert Admin User (default password: Password123!)
INSERT INTO users (id, email, password_hash, first_name, last_name, role_id) 
VALUES (1, 'admin@church.local', '$2a$10$wN16lqjPzF0rYFkC1.P7reO4zO0yv69K0wU2yB1KkJyP9K3IeB3c2', 'Pastor', 'Admin', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert Youth Groups
INSERT INTO youth_groups (id, name, age_min, age_max, leader_id, description)
VALUES 
    (1, 'Juniors', 8, 12, 1, 'Ages 8-12 Sunday school & fellowship'),
    (2, 'Teens', 13, 19, 1, 'Ages 13-19 High school ministry'),
    (3, 'Young Adults', 20, 25, 1, 'Ages 20-25 Campus & young professionals')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Youth Members
INSERT INTO members (id, first_name, last_name, email, phone_number, date_of_birth, gender, guardian_name, guardian_phone, guardian_email, youth_group_id, status, notes)
VALUES
    (1, 'Sarah', 'Johnson', 'sarah.j@example.com', '+1 (555) 234-5678', '2010-05-15', 'F', 'Mary Johnson', '+1 (555) 987-6543', 'mary.j@example.com', 2, 'active', 'Loves choir and youth band'),
    (2, 'Michael', 'Smith', 'michael.s@example.com', '+1 (555) 345-6789', '2009-03-22', 'M', 'David Smith', '+1 (555) 876-5432', 'david.s@example.com', 2, 'active', 'Youth leader trainee'),
    (3, 'Emily', 'Brown', 'emily.b@example.com', '+1 (555) 456-7890', '2012-11-08', 'F', 'Robert Brown', '+1 (555) 765-4321', 'robert.b@example.com', 1, 'active', 'Junior bible quiz champion'),
    (4, 'Joshua', 'Davis', 'joshua.d@example.com', '+1 (555) 567-8901', '2008-07-14', 'M', 'Karen Davis', '+1 (555) 654-3210', 'karen.d@example.com', 2, 'active', 'Sound and AV volunteer'),
    (5, 'Grace', 'Wilson', 'grace.w@example.com', '+1 (555) 678-9012', '2003-09-30', 'F', 'James Wilson', '+1 (555) 543-2109', 'james.w@example.com', 3, 'active', 'Worship coordinator'),
    (6, 'Daniel', 'Taylor', 'daniel.t@example.com', '+1 (555) 789-0123', '2011-01-19', 'M', 'Patricia Taylor', '+1 (555) 432-1098', 'patricia.t@example.com', 1, 'active', 'Needs Sunday bus pickup'),
    (7, 'Hannah', 'Anderson', 'hannah.a@example.com', '+1 (555) 890-1234', '2002-12-05', 'F', 'Thomas Anderson', '+1 (555) 321-0987', 'thomas.a@example.com', 3, 'active', 'College fellowship rep'),
    (8, 'Caleb', 'Thomas', 'caleb.t@example.com', '+1 (555) 901-2345', '2007-04-18', 'M', 'Susan Thomas', '+1 (555) 210-9876', 'susan.t@example.com', 2, 'active', 'Basketball outreach team')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Sessions
INSERT INTO sessions (id, title, description, session_date, session_time, location, session_type, youth_group_id, created_by, expected_attendance)
VALUES
    (1, 'Sunday Youth Fellowship', 'Weekly main youth gathering and praise session', CURRENT_DATE, '10:30:00', 'Youth Chapel Hall', 'service', 2, 1, 25),
    (2, 'Friday Night Bible & Worship', 'Deep dive into the Book of Romans and acoustic worship', CURRENT_DATE - INTERVAL '2 days', '18:30:00', 'Fellowship Room 2B', 'bible_study', 2, 1, 20),
    (3, 'Junior Kingdom Builders', 'Interactive bible story and crafts', CURRENT_DATE, '09:00:00', 'Primary Room A', 'meeting', 1, 1, 15),
    (4, 'Young Adults Catalyst Gathering', 'Leadership discussion and outreach planning', CURRENT_DATE + INTERVAL '1 day', '19:00:00', 'Community Center', 'meeting', 3, 1, 30)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Attendance Records
INSERT INTO attendance (member_id, session_id, status, notes, check_in_time, recorded_by)
VALUES
    (1, 1, 'present', 'On time', CURRENT_TIMESTAMP, 1),
    (2, 1, 'present', 'On time', CURRENT_TIMESTAMP, 1),
    (4, 1, 'late', 'Arrived 15 mins late due to traffic', CURRENT_TIMESTAMP, 1),
    (8, 1, 'present', 'On time', CURRENT_TIMESTAMP, 1),
    (1, 2, 'present', 'Participated in worship', CURRENT_TIMESTAMP - INTERVAL '2 days', 1),
    (2, 2, 'present', 'Shared devotional reading', CURRENT_TIMESTAMP - INTERVAL '2 days', 1),
    (4, 2, 'excused', 'Exam preparation', CURRENT_TIMESTAMP - INTERVAL '2 days', 1),
    (3, 3, 'present', 'Brought bible & craft kit', CURRENT_TIMESTAMP, 1),
    (6, 3, 'present', 'Present', CURRENT_TIMESTAMP, 1)
ON CONFLICT (member_id, session_id) DO UPDATE 
SET status = EXCLUDED.status, check_in_time = EXCLUDED.check_in_time;
