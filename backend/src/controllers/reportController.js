const db = require('../db/database');

/**
 * Get attendance stats per member
 */
exports.getAttendanceByMember = async (req, res, next) => {
    try {
        const { group_id, search } = req.query;

        // Total sessions count
        const sessionCountRes = await db.query('SELECT COUNT(*) AS total FROM sessions');
        const totalSessions = parseInt(sessionCountRes.rows[0].total, 10) || 0;

        let queryText = `
            SELECT 
                m.id,
                m.first_name,
                m.last_name,
                m.phone_number,
                m.date_of_birth,
                yg.name AS group_name,
                m.status AS membership_status,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.session_id END) AS present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.session_id END) AS late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.session_id END) AS absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.session_id END) AS excused_count,
                COUNT(DISTINCT a.session_id) AS total_logged_sessions
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            LEFT JOIN attendance a ON m.id = a.member_id
            WHERE m.deleted_at IS NULL
        `;
        const params = [];
        let paramIndex = 1;

        if (group_id) {
            queryText += ` AND m.youth_group_id = $${paramIndex++}`;
            params.push(parseInt(group_id, 10));
        }

        if (search) {
            queryText += ` AND (m.first_name ILIKE $${paramIndex} OR m.last_name ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        queryText += `
            GROUP BY m.id, m.first_name, m.last_name, m.phone_number, m.date_of_birth, yg.name, m.status
            ORDER BY m.first_name ASC, m.last_name ASC
        `;

        const result = await db.query(queryText, params);

        const reports = result.rows.map(row => {
            const present = parseInt(row.present_count, 10) || 0;
            const late = parseInt(row.late_count, 10) || 0;
            const attended = present + late;
            const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

            let tier = 'At Risk (<50%)';
            if (percentage >= 80) tier = 'Consistent (>80%)';
            else if (percentage >= 50) tier = 'Occasional (50-80%)';

            return {
                ...row,
                total_sessions: totalSessions,
                attended_count: attended,
                attendance_percentage: percentage,
                consistency_tier: tier
            };
        });

        res.json({
            success: true,
            total_sessions: totalSessions,
            members_count: reports.length,
            reports
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Get attendance stats per session
 */
exports.getAttendanceBySession = async (req, res, next) => {
    try {
        const { from_date, to_date, group_id } = req.query;

        let queryText = `
            SELECT 
                s.id,
                s.title,
                s.session_date,
                s.session_time,
                s.session_type,
                yg.name AS group_name,
                COUNT(DISTINCT m.id) AS total_eligible_members,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.member_id END) AS present_count,
                COUNT(DISTINCT CASE WHEN a.status = 'late' THEN a.member_id END) AS late_count,
                COUNT(DISTINCT CASE WHEN a.status = 'absent' THEN a.member_id END) AS absent_count,
                COUNT(DISTINCT CASE WHEN a.status = 'excused' THEN a.member_id END) AS excused_count
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            LEFT JOIN members m ON (m.youth_group_id = yg.id OR s.youth_group_id IS NULL) AND m.status = 'active' AND m.deleted_at IS NULL
            LEFT JOIN attendance a ON s.id = a.session_id AND m.id = a.member_id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (from_date) {
            queryText += ` AND s.session_date >= $${paramIndex++}`;
            params.push(from_date);
        }

        if (to_date) {
            queryText += ` AND s.session_date <= $${paramIndex++}`;
            params.push(to_date);
        }

        if (group_id) {
            queryText += ` AND s.youth_group_id = $${paramIndex++}`;
            params.push(parseInt(group_id, 10));
        }

        queryText += `
            GROUP BY s.id, s.title, s.session_date, s.session_time, s.session_type, yg.name
            ORDER BY s.session_date DESC
        `;

        const result = await db.query(queryText, params);

        const sessionReports = result.rows.map(row => {
            const total = parseInt(row.total_eligible_members, 10) || 0;
            const present = parseInt(row.present_count, 10) || 0;
            const late = parseInt(row.late_count, 10) || 0;
            const attended = present + late;
            const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

            return {
                ...row,
                attended_count: attended,
                attendance_percentage: percentage
            };
        });

        res.json({
            success: true,
            count: sessionReports.length,
            reports: sessionReports
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Group Summary
 */
exports.getGroupSummary = async (req, res, next) => {
    try {
        const result = await db.query(`
            SELECT 
                yg.id,
                yg.name,
                yg.age_min,
                yg.age_max,
                COUNT(DISTINCT m.id) AS active_members,
                COUNT(DISTINCT s.id) AS total_sessions,
                COUNT(DISTINCT CASE WHEN a.status IN ('present', 'late') THEN a.id END) AS total_attendances
            FROM youth_groups yg
            LEFT JOIN members m ON yg.id = m.youth_group_id AND m.status = 'active' AND m.deleted_at IS NULL
            LEFT JOIN sessions s ON yg.id = s.youth_group_id
            LEFT JOIN attendance a ON s.id = a.session_id AND m.id = a.member_id
            GROUP BY yg.id, yg.name, yg.age_min, yg.age_max
            ORDER BY yg.age_min ASC
        `);

        res.json({
            success: true,
            groups: result.rows
        });
    } catch (err) {
        next(err);
    }
};

/**
 * Stream & Export Attendance Logs as CSV
 */
exports.exportCsv = async (req, res, next) => {
    try {
        const { from_date, to_date, group_id } = req.query;

        let queryText = `
            SELECT 
                m.id AS member_id,
                m.first_name,
                m.last_name,
                m.phone_number,
                m.guardian_name,
                m.guardian_phone,
                yg.name AS youth_group,
                s.title AS session_title,
                s.session_date,
                COALESCE(a.status, 'unmarked') AS status,
                a.check_in_time,
                a.notes
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            CROSS JOIN sessions s
            LEFT JOIN attendance a ON m.id = a.member_id AND s.id = a.session_id
            WHERE m.deleted_at IS NULL AND m.status = 'active'
        `;
        const params = [];
        let paramIndex = 1;

        if (from_date) {
            queryText += ` AND s.session_date >= $${paramIndex++}`;
            params.push(from_date);
        }
        if (to_date) {
            queryText += ` AND s.session_date <= $${paramIndex++}`;
            params.push(to_date);
        }
        if (group_id) {
            queryText += ` AND (m.youth_group_id = $${paramIndex++} OR s.youth_group_id = $${paramIndex - 1})`;
            params.push(parseInt(group_id, 10));
        }

        queryText += ` ORDER BY s.session_date DESC, m.first_name ASC`;

        const result = await db.query(queryText, params);

        // Build CSV string
        const headers = [
            'Member ID',
            'First Name',
            'Last Name',
            'Phone',
            'Guardian Name',
            'Guardian Phone',
            'Youth Group',
            'Session Title',
            'Session Date',
            'Status',
            'Check-In Time',
            'Notes'
        ];

        let csv = headers.join(',') + '\n';

        result.rows.forEach(row => {
            const line = [
                row.member_id,
                `"${(row.first_name || '').replace(/"/g, '""')}"`,
                `"${(row.last_name || '').replace(/"/g, '""')}"`,
                `"${(row.phone_number || '').replace(/"/g, '""')}"`,
                `"${(row.guardian_name || '').replace(/"/g, '""')}"`,
                `"${(row.guardian_phone || '').replace(/"/g, '""')}"`,
                `"${(row.youth_group || 'General').replace(/"/g, '""')}"`,
                `"${(row.session_title || '').replace(/"/g, '""')}"`,
                row.session_date || '',
                row.status,
                row.check_in_time || '',
                `"${(row.notes || '').replace(/"/g, '""')}"`
            ];
            csv += line.join(',') + '\n';
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="youth_attendance_report_${new Date().toISOString().slice(0,10)}.csv"`);
        res.status(200).send(csv);
    } catch (err) {
        next(err);
    }
};
