const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

// ============ SUNDAY SERVICE & COMMUNION SCHEDULE ============

/**
 * Get active Sunday Service schedule and order of worship
 */
exports.getSundayService = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                s.*,
                u.first_name as updater_first_name,
                u.last_name as updater_last_name
            FROM sunday_services s
            LEFT JOIN users u ON s.updated_by = u.id
            ORDER BY s.id DESC
            LIMIT 1
        `;

        const result = await queryRunner(query);

        if (result.rows.length === 0) {
            return res.json({
                success: true,
                service: {
                    service_date: new Date().toISOString().slice(0, 10),
                    service_mode: 'two_services',
                    first_service_title: '1st Morning Worship Service',
                    first_service_time: '7:00 AM - 9:00 AM',
                    second_service_title: '2nd Empowerment & Youth Service',
                    second_service_time: '9:30 AM - 12:00 PM',
                    is_communion_sunday: 1,
                    service_theme: 'Walking in Divine Purpose & Excellence',
                    scripture_reading: '1 Timothy 4:12',
                    announcements_note: 'Holy Communion will be administered in both services.'
                }
            });
        }

        res.json({
            success: true,
            service: result.rows[0]
        });
    } catch (err) {
        console.error('Get sunday service error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update Sunday Service schedule (Admin Only)
 */
exports.updateSundayService = async (req, res) => {
    try {
        const {
            service_date,
            service_mode = 'two_services',
            first_service_title = '1st Morning Worship Service',
            first_service_time = '7:00 AM - 9:00 AM',
            second_service_title = '2nd Empowerment & Youth Service',
            second_service_time = '9:30 AM - 12:00 PM',
            joint_service_title = 'Joint Covenant Service',
            joint_service_time = '8:00 AM - 11:30 AM',
            is_communion_sunday = 0,
            service_theme,
            scripture_reading,
            announcements_note
        } = req.body;

        const queryRunner = getQueryRunner(req);

        const query = `
            INSERT OR REPLACE INTO sunday_services (
                id, service_date, service_mode, first_service_title, first_service_time,
                second_service_title, second_service_time, joint_service_title, joint_service_time,
                is_communion_sunday, service_theme, scripture_reading, announcements_note,
                updated_by, updated_at
            ) VALUES (
                1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP
            )
            RETURNING *
        `;

        const result = await queryRunner(query, [
            service_date || new Date().toISOString().slice(0, 10),
            service_mode,
            first_service_title,
            first_service_time,
            second_service_title,
            second_service_time,
            joint_service_title,
            joint_service_time,
            is_communion_sunday ? 1 : 0,
            service_theme || 'Walking in Divine Purpose',
            scripture_reading || '1 Timothy 4:12',
            announcements_note || null,
            req.user ? req.user.id : 1
        ]);

        res.json({
            success: true,
            message: 'Sunday service schedule and order of worship updated successfully!',
            service: result.rows[0]
        });
    } catch (err) {
        console.error('Update sunday service error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
