const db = require('../db/database');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

// ============ USER & ROLE MANAGEMENT (RBAC) ============

/**
 * Get all staff users with title and role
 */
exports.getStaffUsers = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                u.id,
                u.email,
                u.first_name,
                u.last_name,
                u.title,
                u.role_id,
                r.name as role_name,
                r.display_name as role_display_name,
                u.permissions,
                u.created_at,
                u.updated_at
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            ORDER BY u.role_id ASC, u.first_name ASC
        `;

        const result = await queryRunner(query);
        res.json({
            success: true,
            count: result.rows.length,
            users: result.rows
        });
    } catch (err) {
        console.error('Get staff users error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Create a new staff / executive user with title, role and generated credentials
 */
exports.createStaffUser = async (req, res) => {
    try {
        const { email, password = 'Password123!', first_name, last_name, title, role_id = 4, permissions = 'standard' } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!email || !first_name || !last_name) {
            return res.status(400).json({ success: false, error: 'Email, first name, and last name are required' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, title, role_id, permissions, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            RETURNING id, email, first_name, last_name, title, role_id, permissions, created_at
        `;

        const result = await queryRunner(query, [
            email.trim().toLowerCase(),
            passwordHash,
            first_name.trim(),
            last_name.trim(),
            title ? title.trim() : 'Executive Staff',
            parseInt(role_id, 10),
            permissions
        ]);

        res.status(201).json({
            success: true,
            message: 'Executive role account created successfully',
            user: result.rows[0],
            generated_credentials: {
                email: email.trim().toLowerCase(),
                temporary_password: password
            }
        });
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ success: false, error: 'A user with this email already exists in the system' });
        }
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update user role and title
 */
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role_id, title, permissions } = req.body;
        const queryRunner = getQueryRunner(req);

        const query = `
            UPDATE users SET
                role_id = COALESCE($1, role_id),
                title = COALESCE($2, title),
                permissions = COALESCE($3, permissions),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, email, first_name, last_name, title, role_id, permissions
        `;

        const result = await queryRunner(query, [
            role_id ? parseInt(role_id, 10) : null,
            title ? title.trim() : null,
            permissions || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Role permissions updated successfully',
            user: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Delete / Remove staff member
 */
exports.deleteStaffUser = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        if (parseInt(id, 10) === 1) {
            return res.status(400).json({ success: false, error: 'Cannot remove Lead Administrator' });
        }

        await queryRunner('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true, message: 'Staff member removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============ SUPERVISOR AUDIT & COMMENTS ============

/**
 * Get supervisor comments
 */
exports.getSupervisorComments = async (req, res) => {
    try {
        const { portal_section } = req.query;
        const queryRunner = getQueryRunner(req);

        let query = `
            SELECT 
                sc.*,
                u.first_name as admin_first_name,
                u.last_name as admin_last_name
            FROM supervisor_comments sc
            LEFT JOIN users u ON sc.admin_id = u.id
            WHERE 1=1
        `;
        const params = [];
        if (portal_section) {
            query += ` AND sc.portal_section = $1`;
            params.push(portal_section);
        }
        query += ` ORDER BY sc.created_at DESC`;

        const result = await queryRunner(query, params);
        res.json({
            success: true,
            comments: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Add supervisory comment from Admin
 */
exports.addSupervisorComment = async (req, res) => {
    try {
        const { portal_section, target_id, comment_text } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!portal_section || !comment_text) {
            return res.status(400).json({ success: false, error: 'portal_section and comment_text are required' });
        }

        const query = `
            INSERT INTO supervisor_comments (portal_section, target_id, admin_id, comment_text)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const result = await queryRunner(query, [
            portal_section,
            target_id || null,
            req.user ? req.user.id : 1,
            comment_text.trim()
        ]);

        res.status(201).json({
            success: true,
            message: 'Supervisory comment logged successfully',
            comment: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============ ANNOUNCEMENTS & FLYERS ============

exports.getAnnouncements = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                a.*,
                yg.name as group_name,
                u.first_name as posted_by_first_name,
                u.last_name as posted_by_last_name,
                u.title as poster_title
            FROM announcements a
            LEFT JOIN youth_groups yg ON a.youth_group_id = yg.id
            LEFT JOIN users u ON a.posted_by = u.id
            ORDER BY a.created_at DESC
        `;

        const result = await queryRunner(query);
        res.json({
            success: true,
            announcements: result.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, category = 'announcement', image_url, video_url, youth_group_id } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!title || !content) {
            return res.status(400).json({ success: false, error: 'Title and content are required' });
        }

        const query = `
            INSERT INTO announcements (title, content, category, image_url, video_url, youth_group_id, posted_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await queryRunner(query, [
            title.trim(),
            content.trim(),
            category,
            image_url || null,
            video_url || null,
            youth_group_id ? parseInt(youth_group_id, 10) : null,
            req.user ? req.user.id : 1
        ]);

        res.status(201).json({
            success: true,
            message: 'Announcement published successfully',
            announcement: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        await queryRunner('DELETE FROM announcements WHERE id = $1', [id]);
        res.json({ success: true, message: 'Announcement removed' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============ DATABASE LIVE OVERVIEW ============

exports.getDbOverview = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);

        const [usersCount, groupsCount, membersCount, sessionsCount, attendanceCount, auditCount, galleryCount, duesCount] = await Promise.all([
            queryRunner('SELECT COUNT(*) as count FROM users'),
            queryRunner('SELECT COUNT(*) as count FROM youth_groups'),
            queryRunner('SELECT COUNT(*) as count FROM members WHERE deleted_at IS NULL'),
            queryRunner('SELECT COUNT(*) as count FROM sessions'),
            queryRunner('SELECT COUNT(*) as count FROM attendance'),
            queryRunner('SELECT COUNT(*) as count FROM attendance_history'),
            queryRunner('SELECT COUNT(*) as count FROM gallery'),
            queryRunner('SELECT COUNT(*) as count FROM dues_and_levies')
        ]);

        const dbPath = path.resolve(__dirname, '../../youth_attendance.sqlite');
        let fileSize = 'Unknown';
        if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            fileSize = `${(stats.size / 1024).toFixed(2)} KB`;
        }

        res.json({
            success: true,
            database: {
                driver: db.getDriver(),
                file_location: dbPath,
                file_size: fileSize,
                status: 'Healthy & Connected',
                timestamp: new Date().toISOString(),
                tables: [
                    { name: 'users (Staff & Executives)', row_count: parseInt(usersCount.rows[0].count, 10), description: 'Staff credentials and RBAC permissions' },
                    { name: 'youth_groups', row_count: parseInt(groupsCount.rows[0].count, 10), description: 'Age groups (Juniors, Teens, Young Adults)' },
                    { name: 'members (Enrolled Youth)', row_count: parseInt(membersCount.rows[0].count, 10), description: 'Registered youth & guardian info' },
                    { name: 'sessions (Yearly Timeline & Events)', row_count: parseInt(sessionsCount.rows[0].count, 10), description: 'Services, meetings, and dates' },
                    { name: 'attendance (Check-In Logs)', row_count: parseInt(attendanceCount.rows[0].count, 10), description: 'Real-time check-in records' },
                    { name: 'gallery (Photos & Videos)', row_count: parseInt(galleryCount.rows[0].count, 10), description: 'Retreat highlights, albums and videos' },
                    { name: 'dues_and_levies (Transparency)', row_count: parseInt(duesCount.rows[0].count, 10), description: 'Dues & camp levy financial ledger' },
                    { name: 'attendance_history (Audit Trail)', row_count: parseInt(auditCount.rows[0].count, 10), description: 'Audit history of status changes' }
                ]
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
