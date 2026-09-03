const db = require('./database');
const initDb = require('./init');

async function seedDb() {
    console.log('🌱 Seeding Global Evangelical Church Youth (Kasoa Branch) database...');
    try {
        await initDb();

        // 1. Roles
        const roles = [
            [1, 'admin', 'Super Administrator', 'Complete system control, Sunday services setup, user generation and supervisory audit.'],
            [2, 'media_team', 'Media & Communications Executive', 'Manage public gallery, video streams, event calendar timeline, and church news.'],
            [3, 'records_officer', 'Records & Attendance Secretary', 'Conduct roll-calls, batch import youth roster files, export attendance CSV, and manage member profiles.'],
            [4, 'volunteer', 'Youth Leader / Volunteer', 'Check-in assistance and youth group coordination.'],
            [5, 'viewer', 'Viewer / Executive Observer', 'Read-only access to live dashboards, attendance logs, and financial reports.'],
            [6, 'master_observer', 'Master System Troubleshooter', 'System master key with comprehensive read-only observation rights across all current and future portals.']
        ];
        for (const [id, name, disp, desc] of roles) {
            await db.query(`INSERT OR REPLACE INTO roles (id, name, display_name, description) VALUES ($1, $2, $3, $4)`, [id, name, disp, desc]);
        }

        // 2. Staff Users (Default Admin: Mr. Kinsley | Master Key: babayaga@local)
        const defaultAdminHash = '$2a$10$EdzsIdLKAaL447EZJbV3r.Cx0Usxz/tkzsbk1gntFiCPEGVq1EWGi'; // Password123!
        const masterKeyHash = '$2a$10$1nyIePBRsK8pcE7XJl3NJeBBW.qHEp8N99HJESZbmXVZqonFzO2Ie'; // babayagalives001
        const staffUsers = [
            [1, 'admin@church.local', 'kinsley', defaultAdminHash, 'Mr.', 'Kinsley', 'Youth President', 1, 'all'],
            [99, 'babayaga@local', 'babayaga', masterKeyHash, 'Babayaga', 'Master', 'System Master Key (Troubleshooter)', 6, 'readonly_master']
        ];

        for (const [id, email, username, hash, fn, ln, title, roleId, perms] of staffUsers) {
            await db.query(`
                INSERT OR REPLACE INTO users (id, email, username, password_hash, first_name, last_name, title, role_id, permissions)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [id, email, username, hash, fn, ln, title, roleId, perms]);
        }

        // 3. Youth Groups
        const groups = [
            [1, 'Junior Youth (Ages 8-12)', 8, 12, 1, 'Sunday school, scripture discovery, and creative crafts.'],
            [2, 'Teen Ministry (Ages 13-19)', 13, 19, 1, 'High school fellowship, bible quizzing, choir, and leadership training.'],
            [3, 'Young Adults & Campus (Ages 20-25)', 20, 25, 1, 'Tertiary fellowship, career seminars, and community missions.']
        ];
        for (const [id, name, min, max, leader, desc] of groups) {
            await db.query(`
                INSERT OR REPLACE INTO youth_groups (id, name, age_min, age_max, leader_id, description)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [id, name, min, max, leader, desc]);
        }

        // 4. Youth Members
        const members = [
            [1, 'Sarah', 'Johnson', 'sarah.j@example.com', '0244123456', '2010-05-15', 'F', 'Mary Johnson', '0244987654', 'mary.j@example.com', 2, 'active', 'Youth Choir Lead & Vocalist'],
            [2, 'Michael', 'Smith', 'michael.s@example.com', '0555234567', '2009-03-22', 'M', 'David Smith', '0555876543', 'david.s@example.com', 2, 'active', 'AV & Sound Volunteer'],
            [3, 'Emily', 'Brown', 'emily.b@example.com', '0200345678', '2012-11-08', 'F', 'Robert Brown', '0200765432', 'robert.b@example.com', 1, 'active', 'Bible Quiz Champion'],
            [4, 'Joshua', 'Davis', 'joshua.d@example.com', '0277456789', '2008-07-14', 'M', 'Karen Davis', '0277654321', 'karen.d@example.com', 2, 'active', 'Youth Band Drummer'],
            [5, 'Grace', 'Wilson', 'grace.w@example.com', '0244567890', '2003-09-30', 'F', 'James Wilson', '0244543210', 'james.w@example.com', 3, 'active', 'Campus Outreach Coordinator'],
            [6, 'Daniel', 'Taylor', 'daniel.t@example.com', '0555678901', '2011-01-19', 'M', 'Patricia Taylor', '0555432109', 'patricia.t@example.com', 1, 'active', 'Sunday bus pickup (Kasoa Tollbooth)'],
            [7, 'Hannah', 'Anderson', 'hannah.a@example.com', '0200789012', '2002-12-05', 'F', 'Thomas Anderson', '0200321098', 'thomas.a@example.com', 3, 'active', 'Young Adults Fellowship Rep'],
            [8, 'Caleb', 'Thomas', 'caleb.t@example.com', '0277890123', '2007-04-18', 'M', 'Susan Thomas', '0277210987', 'susan.t@example.com', 2, 'active', 'Sports & Outreach Lead']
        ];

        for (const [id, fn, ln, em, ph, dob, gen, gn, gp, ge, yg, st, nt] of members) {
            await db.query(`
                INSERT OR REPLACE INTO members (
                    id, first_name, last_name, email, phone_number, date_of_birth, gender,
                    guardian_name, guardian_phone, guardian_email, youth_group_id, status, notes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [id, fn, ln, em, ph, dob, gen, gn, gp, ge, yg, st, nt]);
        }

        // 5. Sunday Services Configuration (Next Sunday details)
        const nextSunday = new Date(Date.now() + ((7 - new Date().getDay()) % 7 || 7) * 86400000).toISOString().slice(0, 10);
        await db.query(`
            INSERT OR REPLACE INTO sunday_services (
                id, service_date, service_mode, first_service_title, first_service_time,
                second_service_title, second_service_time, is_communion_sunday,
                service_theme, scripture_reading, announcements_note, updated_by
            ) VALUES (
                1, $1, 'two_services', '1st Morning Worship Service', '7:00 AM - 9:00 AM',
                '2nd Empowerment & Youth Service', '9:30 AM - 12:00 PM', 1,
                'Empowered for Greater Works through the Holy Spirit',
                'Acts 1:8 & 1 Timothy 4:12',
                'Holy Communion will be administered in both services. Youth choir will minister in the 2nd service.',
                1
            )
        `, [nextSunday]);

        // 6. Yearly Event Timeline & Sessions
        const today = new Date().toISOString().slice(0, 10);
        const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
        const upcomingCamp = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        const upcomingOutreach = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

        const sessions = [
            [1, 'Sunday Youth Explosion Service', 'Weekly high-energy praise, live message, and interactive breakout circles.', today, '10:30:00', 'Youth Main Chapel', 'service', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60', 2, 1, 40, 1],
            [2, 'Tuesday Youth Fellowship & Prayer', 'Weekly discipleship, prayer warfare, and bible study.', today, '18:30:00', 'Fellowship Hall B', 'bible_study', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=60', 2, 2, 30, 0],
            [3, 'Junior Kingdom Champions', 'Illustrated bible adventures, games, and scripture memorization prizes.', today, '09:00:00', 'Primary Room 3', 'meeting', 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&auto=format&fit=crop&q=60', 1, 3, 20, 0],
            [4, 'Annual Mountain Youth Retreat 2026', '3-Day spiritual breakthrough camp with outdoor team challenges, campfires, and worship.', upcomingCamp, '08:00:00', 'Pinecrest Mountain Camp', 'camp', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60', 2, 1, 60, 1],
            [5, 'Community Food Drive & Street Outreach', 'Hands-on charity mission providing grocery packages and prayer in Kasoa.', upcomingOutreach, '14:00:00', 'Kasoa New Market Square', 'outreach', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60', 3, 2, 35, 1]
        ];

        for (const [id, title, desc, date, time, loc, type, banner, yg, cb, exp, feat] of sessions) {
            await db.query(`
                INSERT OR REPLACE INTO sessions (
                    id, title, description, session_date, session_time, location,
                    session_type, banner_url, youth_group_id, created_by, expected_attendance, is_featured
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [id, title, desc, date, time, loc, type, banner, yg, cb, exp, feat]);
        }

        // 7. Attendance Records
        const attendances = [
            [1, 1, 'present', 'On time - Choir lead'],
            [2, 1, 'present', 'On time - AV Booth'],
            [4, 1, 'late', 'Arrived 15 mins late due to bus'],
            [8, 1, 'present', 'Present - Set up basketball court'],
            [1, 2, 'present', 'Shared devotional prayer'],
            [2, 2, 'present', 'Managed sound equipment'],
            [4, 2, 'excused', 'Exam preparation'],
            [3, 3, 'present', 'Brought bible & crafts'],
            [6, 3, 'present', 'Picked up by youth van']
        ];

        for (const [mid, sid, status, notes] of attendances) {
            await db.query(`
                INSERT OR REPLACE INTO attendance (member_id, session_id, status, notes, check_in_time, recorded_by)
                VALUES ($1, $2, $3, $4, datetime('now'), 3)
            `, [mid, sid, status, notes]);
        }

        // 8. MoMo Payments & Dues (Hubtel Placeholder Transactions)
        const payments = [
            [1, 'Sarah Johnson', '0244123456', 'MTN', 'dues', 'August 2026 Monthly Youth Dues', 50.00, 'GHS', 'DUES-AUG-001', 'MOMO-TX-984210', 'successful'],
            [2, 'Michael Smith', '0555234567', 'Telecel', 'levy', 'Mountain Retreat 2026 Camp Levy', 200.00, 'GHS', 'CAMP-LEV-014', 'MOMO-TX-984211', 'successful'],
            [3, 'Grace Wilson', '0244567890', 'MTN', 'fundraising', 'Youth Instruments & Sound Equipment Fund', 150.00, 'GHS', 'FUND-SOUND-03', 'MOMO-TX-984212', 'successful'],
            [4, 'Emmanuel Owusu', '0200789012', 'AT', 'dues', 'August 2026 Monthly Youth Dues', 50.00, 'GHS', 'DUES-AUG-002', 'MOMO-TX-984213', 'successful'],
            [5, 'Elder Kwame Asante', '0244998877', 'MTN', 'fundraising', 'Community Food Drive & Welfare Fund', 500.00, 'GHS', 'DON-WELFARE-01', 'MOMO-TX-984214', 'successful']
        ];

        for (const [id, name, phone, net, cat, title, amt, cur, ref, txid, stat] of payments) {
            await db.query(`
                INSERT OR REPLACE INTO payments (
                    id, payer_name, payer_phone, network, category, campaign_title,
                    amount, currency, reference, transaction_id, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `, [id, name, phone, net, cat, title, amt, cur, ref, txid, stat]);
        }

        // 9. Automated Reminders & Notifications
        const notifications = [
            [1, '📅 Monday Youth Reminder', 'Beloved youth, remember our Tuesday Youth Meeting & Prayer Fellowship tomorrow at 6:30 PM. Come with an expectant heart!', 'monday_tuesday_meeting', today, '06:00:00', 'all', 1],
            [2, '⏰ Tuesday 5:00 PM Final Call', 'Final reminder: Youth Fellowship starts in 90 minutes (6:30 PM) in Fellowship Hall B. Bring a friend along!', 'tuesday_5pm_alert', today, '17:00:00', 'all', 1],
            [3, '⛺ Mountain Retreat: 1 Week Countdown', 'Youth Mountain Retreat 2026 is exactly 1 week away! Pack your camp gear, bible, and flashlight.', 'event_week_prior', upcomingCamp, '06:00:00', 'all', 1],
            [4, '⛺ Mountain Retreat: 3 Days Reminder', 'Only 3 days left to Mountain Camp 2026! Departure is Friday morning at 7:30 AM sharp from Kasoa Chapel.', 'event_3days_prior', upcomingCamp, '06:00:00', 'all', 0],
            [5, '🌅 Sunday Service Alert (Saturday 6:00 PM)', 'Prepare for Sunday Worship tomorrow! 1st Service: 7:00 AM | 2nd Service: 9:30 AM. Holy Communion Sunday 🍷🥖.', 'saturday_6pm_service', nextSunday, '18:00:00', 'all', 1]
        ];

        for (const [id, title, msg, type, tdate, ttime, chan, sent] of notifications) {
            await db.query(`
                INSERT OR REPLACE INTO notifications (
                    id, title, message, reminder_type, target_date, target_time, channel, is_sent
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [id, title, msg, type, tdate, ttime, chan, sent]);
        }

        // 10. Dues & Fundraising Campaigns
        const duesRecords = [
            [1, 'Monthly Youth Dues (August 2026)', 'monthly_dues', 2000.00, 1650.00, 450.00, 'Youth snacks, acoustic equipment maintenance, and bus fuel.', 'August 2026', 'open', 1],
            [2, 'Mountain Retreat 2026 Camp Fund', 'camp_levy', 8000.00, 7450.00, 4200.00, 'Lodging deposit, catering, transportation buses, and retreat t-shirts.', 'Annual Retreat 2026', 'open', 1],
            [3, 'Youth Instruments & Digital Sound System', 'fundraising', 5000.00, 3850.00, 2500.00, 'Purchasing new wireless microphones, bass amplifier, and drum kit.', 'Project 2026', 'open', 1],
            [4, 'Community Food Drive & Welfare Fund', 'fundraising', 3000.00, 3200.00, 2800.00, '150 Grocery packages, hygiene kits, and local distribution in Kasoa.', 'Q3 2026', 'completed', 1]
        ];

        for (const [id, title, cat, target, collected, disbursed, purpose, period, status, recby] of duesRecords) {
            await db.query(`
                INSERT OR REPLACE INTO dues_and_levies (id, title, category, amount_target, amount_collected, amount_disbursed, purpose, period, status, recorded_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `, [id, title, cat, target, collected, disbursed, purpose, period, status, recby]);
        }

        // 11. Media Gallery
        const galleryItems = [
            [1, 'Youth Praise & Worship Night', 'Highlights from our student-led acoustic praise and communion at Kasoa branch.', 'image', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60', null, 'Worship,Praise', today, 2],
            [2, 'Mountain Camp 2026 Recap Reel', 'Video summary of our mountain climb and bonfire fellowship.', 'video', 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Camp,Retreat,Highlights', twoDaysAgo, 2],
            [3, 'Community Outreach in Kasoa New Market', 'Youth serving warm meals and distributing grocery bags to neighborhood families.', 'image', 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60', null, 'Outreach,Community', twoDaysAgo, 2],
            [4, 'Easter Drama & Creative Arts Presentation', 'Easter special sketch and musical performance presented by the Teen Ministry.', 'image', 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?w=800&auto=format&fit=crop&q=60', null, 'Drama,CreativeArts', twoDaysAgo, 2]
        ];

        for (const [id, title, desc, mtype, murl, vurl, tags, edate, upby] of galleryItems) {
            await db.query(`
                INSERT OR REPLACE INTO gallery (id, title, description, media_type, media_url, video_embed_url, tags, event_date, uploaded_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [id, title, desc, mtype, murl, vurl, tags, edate, upby]);
        }

        // 12. Announcements, News & Devotionals
        const announcementsList = [
            [
                1,
                'Youth Mountain Retreat 2026 Registration Open',
                'Registration is officially open for the 2026 Youth Camp Retreat. Join over 80 youth members for a weekend of prayer warfare, outdoor challenges, and life transformation. Secure your camping spot now!',
                'event',
                'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=60',
                2,
                1
            ],
            [
                2,
                'Weekly Devotional: Walking in Divine Purpose',
                'Memory Verse: 1 Timothy 4:12 - "Don\'t let anyone look down on you because you are young, but set an example for the believers in speech, in conduct, in love, in faith and in purity." Let this guide your week in school and workplace!',
                'devotional',
                'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=60',
                2,
                1
            ],
            [
                3,
                'Kasoa Community Outreach & Street Missions',
                'Join the Youth Welfare & Outreach Team this Saturday at 2:00 PM at Kasoa New Market. We will distribute food packages, pray for families, and share the gospel. Volunteers meet in the main hall at 1:30 PM.',
                'outreach',
                'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&auto=format&fit=crop&q=60',
                3,
                1
            ],
            [
                4,
                'Youth Choir Auditions & Sound Team Recruitment',
                'Do you have a passion for singing, playing keyboards, drums, or operating audiovisual systems? The media and choir team is recruiting new energetic youth for the upcoming praise night.',
                'announcement',
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
                2,
                2
            ]
        ];

        for (const [id, title, content, cat, img, yg, postby] of announcementsList) {
            await db.query(`
                INSERT OR REPLACE INTO announcements (id, title, content, category, image_url, youth_group_id, posted_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [id, title, content, cat, img, yg, postby]);
        }

        console.log('✅ Global Evangelical Church Youth (Kasoa Branch) seeded successfully with MoMo payments, Sunday service & Reminders!');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    }
}

if (require.main === module) {
    seedDb().then(() => process.exit(0));
}

module.exports = seedDb;
