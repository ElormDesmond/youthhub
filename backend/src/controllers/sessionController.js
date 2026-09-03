// Session Controller - Manage meetings, events, and sessions
const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

exports.getAllSessions = async (req, res) => {
    try {
        const { group_id, session_type, from_date, to_date } = req.query;
        const queryRunner = getQueryRunner(req);

        let query = `
            SELECT 
                s.*,
                yg.name as group_name,
                yg.name as youth_group_name,
                u.first_name as organizer_first_name,
                u.last_name as organizer_last_name,
                COUNT(DISTINCT a.id) as total_attendance_records,
                COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END) as attended,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused_count
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            LEFT JOIN users u ON s.created_by = u.id
            LEFT JOIN attendance a ON s.id = a.session_id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

        // Filter by group
        if (group_id) {
            query += ` AND s.youth_group_id = $${paramCount}`;
            params.push(parseInt(group_id, 10));
            paramCount++;
        }

        // Filter by session type
        if (session_type) {
            query += ` AND s.session_type = $${paramCount}`;
            params.push(session_type);
            paramCount++;
        }

        // Filter by date range
        if (from_date) {
            query += ` AND s.session_date >= $${paramCount}`;
            params.push(from_date);
            paramCount++;
        }

        if (to_date) {
            query += ` AND s.session_date <= $${paramCount}`;
            params.push(to_date);
            paramCount++;
        }

        query += ` GROUP BY s.id, yg.name, u.first_name, u.last_name ORDER BY s.session_date DESC`;

        const result = await queryRunner(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
            sessions: result.rows
        });
    } catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getSessions = exports.getAllSessions;

exports.getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        const query = `
            SELECT 
                s.*,
                yg.name as group_name,
                yg.name as youth_group_name,
                u.first_name as organizer_first_name,
                u.last_name as organizer_last_name
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = $1
        `;

        const result = await queryRunner(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            session: result.rows[0]
        });
    } catch (error) {
        console.error('Get session by ID error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.createSession = async (req, res) => {
    try {
        const {
            title,
            description,
            session_date,
            session_time,
            location,
            session_type,
            youth_group_id,
            expected_attendance,
            created_by
        } = req.body;
        const queryRunner = getQueryRunner(req);

        // Validation
        if (!title || !session_date) {
            return res.status(400).json({
                success: false,
                error: 'title and session_date are required'
            });
        }

        const query = `
            INSERT INTO sessions (
                title, description, session_date, session_time, location,
                session_type, youth_group_id, created_by, expected_attendance
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            title.trim(),
            description || null,
            session_date,
            session_time || '10:00:00',
            location || 'Main Hall',
            session_type || 'meeting',
            youth_group_id ? parseInt(youth_group_id, 10) : null,
            created_by || (req.user ? req.user.id : 1),
            expected_attendance ? parseInt(expected_attendance, 10) : null
        ];

        const result = await queryRunner(query, values);

        res.status(201).json({
            success: true,
            message: 'Session created successfully',
            data: result.rows[0],
            session: result.rows[0]
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        const queryRunner = getQueryRunner(req);

        const allowedFields = [
            'title', 'description', 'session_date', 'session_time',
            'location', 'session_type', 'youth_group_id', 'expected_attendance'
        ];

        const updateClauses = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updateFields).forEach(key => {
            if (allowedFields.includes(key)) {
                updateClauses.push(`${key} = $${paramCount}`);
                values.push(updateFields[key]);
                paramCount++;
            }
        });

        if (updateClauses.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No valid fields provided for update'
            });
        }

        updateClauses.push('updated_at = CURRENT_TIMESTAMP');

        const query = `
            UPDATE sessions
            SET ${updateClauses.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        values.push(id);

        const result = await queryRunner(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            message: 'Session updated successfully',
            data: result.rows[0],
            session: result.rows[0]
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        // Delete session (cascade deletes attendance records)
        const query = `DELETE FROM sessions WHERE id = $1 RETURNING *`;

        const result = await queryRunner(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            message: 'Session deleted successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get session attendance summary
exports.getSessionSummary = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        const query = `
            SELECT 
                s.id,
                s.title,
                s.session_date,
                s.session_type,
                yg.name as group_name,
                COUNT(DISTINCT m.id) as expected_members,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN m.id END) as present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN m.id END) as late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN m.id END) as absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN m.id END) as excused_count,
                COUNT(DISTINCT CASE WHEN a.status = 'awaiting' THEN m.id END) as awaiting_count,
                ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN m.id END) 
                    / NULLIF(COUNT(DISTINCT m.id), 0), 2) as attendance_percentage
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            LEFT JOIN members m ON m.youth_group_id = yg.id AND m.status = 'active'
            LEFT JOIN attendance a ON m.id = a.member_id AND a.session_id = s.id
            WHERE s.id = $1
            GROUP BY s.id, s.title, s.session_date, s.session_type, yg.name
        `;

        const result = await queryRunner(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0],
            summary: result.rows[0]
        });
    } catch (error) {
        console.error('Get session summary error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
