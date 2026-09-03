// routes/reports.js - Reporting and analytics endpoints

const express = require('express');
const router = express.Router();
const db = require('../db/database');
const reportController = require('../controllers/reportController');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

/**
 * GET /api/reports/attendance-by-member
 * Get attendance statistics per member
 * Query params: from_date, to_date, group_id
 */
router.get('/attendance-by-member', async (req, res) => {
    try {
        const { from_date, to_date, group_id } = req.query;
        const queryRunner = getQueryRunner(req);

        let query = `
            SELECT 
                m.id,
                m.first_name,
                m.last_name,
                yg.name as group_name,
                COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END) as attended,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused_count,
                COUNT(DISTINCT a.id) as total_sessions,
                ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END)
                    / NULLIF(COUNT(DISTINCT a.id), 0), 2) as attendance_percentage
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            LEFT JOIN attendance a ON m.id = a.member_id
            LEFT JOIN sessions s ON a.session_id = s.id
            WHERE m.status = 'active' AND (m.deleted_at IS NULL)
        `;

        const params = [];
        let paramCount = 1;

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

        if (group_id) {
            query += ` AND m.youth_group_id = $${paramCount}`;
            params.push(parseInt(group_id, 10));
            paramCount++;
        }

        query += ` GROUP BY m.id, m.first_name, m.last_name, yg.name ORDER BY attendance_percentage DESC NULLS LAST`;

        const result = await queryRunner(query, params);

        const reports = result.rows.map(row => {
            const pct = parseFloat(row.attendance_percentage) || 0;
            let tier = 'At Risk (<50%)';
            if (pct >= 80) tier = 'Consistent (>80%)';
            else if (pct >= 50) tier = 'Occasional (50-80%)';
            return {
                ...row,
                attendance_percentage: Math.round(pct),
                consistency_tier: tier
            };
        });

        res.json({
            success: true,
            count: reports.length,
            members_count: reports.length,
            data: reports,
            reports
        });
    } catch (error) {
        console.error('Attendance by member error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/attendance-by-session
 * Get attendance statistics per session
 * Query params: from_date, to_date, group_id
 */
router.get('/attendance-by-session', async (req, res) => {
    try {
        const { from_date, to_date, group_id } = req.query;
        const queryRunner = getQueryRunner(req);

        let query = `
            SELECT 
                s.id,
                s.title,
                s.session_date,
                s.session_type,
                yg.name as group_name,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.id END) as late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.id END) as absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.id END) as excused_count,
                COUNT(DISTINCT CASE WHEN a.status = 'awaiting' THEN a.id END) as awaiting,
                COUNT(DISTINCT m.id) as expected_count,
                ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END)
                    / NULLIF(COUNT(DISTINCT m.id), 0), 2) as attendance_percentage
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            LEFT JOIN members m ON (m.youth_group_id = yg.id OR s.youth_group_id IS NULL) AND m.status = 'active' AND (m.deleted_at IS NULL)
            LEFT JOIN attendance a ON m.id = a.member_id AND a.session_id = s.id
            WHERE 1=1
        `;

        const params = [];
        let paramCount = 1;

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

        if (group_id) {
            query += ` AND s.youth_group_id = $${paramCount}`;
            params.push(parseInt(group_id, 10));
            paramCount++;
        }

        query += ` GROUP BY s.id, s.title, s.session_date, s.session_type, yg.name ORDER BY s.session_date DESC`;

        const result = await queryRunner(query, params);

        const reports = result.rows.map(row => ({
            ...row,
            attendance_percentage: Math.round(parseFloat(row.attendance_percentage) || 0)
        }));

        res.json({
            success: true,
            count: reports.length,
            data: reports,
            reports
        });
    } catch (error) {
        console.error('Attendance by session error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/group-summary
 * Overall statistics by youth group
 */
router.get('/group-summary', async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                yg.id,
                yg.name,
                yg.age_min,
                yg.age_max,
                COUNT(DISTINCT m.id) as total_members,
                COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) as active_members,
                COUNT(DISTINCT s.id) as total_sessions,
                COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END) as total_attendances,
                ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END)
                    / NULLIF(COUNT(DISTINCT a.id), 0), 2) as overall_attendance_percentage
            FROM youth_groups yg
            LEFT JOIN members m ON yg.id = m.youth_group_id AND (m.deleted_at IS NULL)
            LEFT JOIN sessions s ON yg.id = s.youth_group_id
            LEFT JOIN attendance a ON s.id = a.session_id
            GROUP BY yg.id, yg.name, yg.age_min, yg.age_max
            ORDER BY yg.name
        `;

        const result = await queryRunner(query);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
            groups: result.rows
        });
    } catch (error) {
        console.error('Group summary error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/reports/export-csv
 */
router.get('/export-csv', reportController.exportCsv);

module.exports = router;
