// Attendance Controller - Check-in and status management
const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

exports.getSessionAttendance = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { group_id, search, status_filter } = req.query;
        const queryRunner = getQueryRunner(req);

        // Get session details
        const sessionQuery = `
            SELECT s.*, yg.name as group_name
            FROM sessions s
            LEFT JOIN youth_groups yg ON s.youth_group_id = yg.id
            WHERE s.id = $1
        `;

        const sessionResult = await queryRunner(sessionQuery, [sessionId]);

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        const session = sessionResult.rows[0];

        // Get all members for this group with their attendance status
        let memberQuery = `
            SELECT 
                m.id,
                m.id as member_id,
                m.first_name,
                m.last_name,
                m.phone_number,
                m.guardian_name,
                m.guardian_phone,
                m.youth_group_id,
                m.date_of_birth,
                yg.name as group_name,
                yg.name as youth_group_name,
                COALESCE(a.status, 'awaiting') as status,
                a.check_in_time,
                a.notes,
                COALESCE(a.id, 0) as attendance_id
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            LEFT JOIN attendance a ON m.id = a.member_id AND a.session_id = $1
            WHERE m.status = 'active' AND (m.deleted_at IS NULL)
        `;

        const params = [sessionId];
        let paramCount = 2;

        // Filter by group if specified
        if (group_id) {
            memberQuery += ` AND m.youth_group_id = $${paramCount}`;
            params.push(parseInt(group_id, 10));
            paramCount++;
        } else if (session.youth_group_id) {
            memberQuery += ` AND (m.youth_group_id = $${paramCount} OR m.youth_group_id IS NULL)`;
            params.push(session.youth_group_id);
            paramCount++;
        }

        if (search) {
            memberQuery += ` AND (m.first_name ILIKE $${paramCount} OR m.last_name ILIKE $${paramCount} OR m.phone_number ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (status_filter) {
            if (status_filter === 'awaiting') {
                memberQuery += ` AND (a.status IS NULL OR a.status = 'awaiting')`;
            } else {
                memberQuery += ` AND a.status = $${paramCount}`;
                params.push(status_filter);
                paramCount++;
            }
        }

        memberQuery += ` ORDER BY m.first_name, m.last_name`;

        const membersResult = await queryRunner(memberQuery, params);

        // Calculate statistics
        const stats = {
            total: membersResult.rows.length,
            present: membersResult.rows.filter(m => m.status === 'present').length,
            absent: membersResult.rows.filter(m => m.status === 'absent').length,
            late: membersResult.rows.filter(m => m.status === 'late').length,
            excused: membersResult.rows.filter(m => m.status === 'excused').length,
            awaiting: membersResult.rows.filter(m => !m.status || m.status === 'awaiting').length,
        };

        stats.attended = stats.present + stats.late;
        stats.attendance_percentage = stats.total > 0
            ? Math.round(((stats.present + stats.late) / stats.total) * 100)
            : 0;
        stats.percentage = stats.attendance_percentage;

        res.json({
            success: true,
            session,
            members: membersResult.rows,
            roster: membersResult.rows,
            statistics: stats,
            stats
        });
    } catch (error) {
        console.error('Get session attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.recordAttendance = async (req, res) => {
    try {
        const { member_id, session_id, status, check_in_time, notes } = req.body;
        const queryRunner = getQueryRunner(req);

        // Validate input
        if (!member_id || !session_id || !status) {
            return res.status(400).json({
                success: false,
                error: 'member_id, session_id, and status are required'
            });
        }

        const validStatuses = ['present', 'absent', 'late', 'excused', 'awaiting'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        // Check if member exists
        const memberCheck = await queryRunner(
            'SELECT id FROM members WHERE id = $1',
            [member_id]
        );

        if (memberCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found'
            });
        }

        // Check if session exists
        const sessionCheck = await queryRunner(
            'SELECT id FROM sessions WHERE id = $1',
            [session_id]
        );

        if (sessionCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Session not found'
            });
        }

        // Check if attendance record already exists
        const existingAttendance = await queryRunner(
            'SELECT id, status FROM attendance WHERE member_id = $1 AND session_id = $2',
            [member_id, session_id]
        );

        let result;

        if (existingAttendance.rows.length > 0) {
            // Update existing record
            const attendanceId = existingAttendance.rows[0].id;
            const oldStatus = existingAttendance.rows[0].status;

            const effectiveTime = (status === 'present' || status === 'late') ? (check_in_time || new Date().toISOString()) : null;

            const updateQuery = `
                UPDATE attendance
                SET status = $1, check_in_time = $2, notes = $3, updated_at = CURRENT_TIMESTAMP
                WHERE id = $4
                RETURNING *
            `;

            result = await queryRunner(updateQuery, [
                status,
                effectiveTime,
                notes || null,
                attendanceId
            ]);

            // Log status change
            if (oldStatus !== status) {
                try {
                    await queryRunner(
                        `INSERT INTO attendance_history (attendance_id, old_status, new_status, changed_at)
                         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
                        [attendanceId, oldStatus, status]
                    );
                } catch (hErr) {
                    // History table optional logging
                }
            }

            res.json({
                success: true,
                message: 'Attendance updated successfully',
                data: result.rows[0],
                record: result.rows[0]
            });
        } else {
            // Create new record
            const effectiveTime = (status === 'present' || status === 'late') ? (check_in_time || new Date().toISOString()) : null;

            const insertQuery = `
                INSERT INTO attendance (member_id, session_id, status, check_in_time, notes, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                RETURNING *
            `;

            result = await queryRunner(insertQuery, [
                member_id,
                session_id,
                status,
                effectiveTime,
                notes || null
            ]);

            res.status(200).json({
                success: true,
                message: 'Attendance recorded successfully',
                data: result.rows[0],
                record: result.rows[0]
            });
        }
    } catch (error) {
        console.error('Record attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Quick toggle status during check-in
exports.toggleAttendanceStatus = async (req, res) => {
    try {
        const { member_id, session_id } = req.params;
        const new_status = req.body.new_status || req.body.status;
        const queryRunner = getQueryRunner(req);

        if (!new_status) {
            return res.status(400).json({
                success: false,
                error: 'new_status is required'
            });
        }

        req.body.member_id = member_id;
        req.body.session_id = session_id;
        req.body.status = new_status;
        return exports.recordAttendance(req, res);
    } catch (error) {
        console.error('Toggle attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateAttendance = exports.toggleAttendanceStatus;

// Get all attendance records for a member
exports.getMemberAttendanceHistory = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { limit = 50 } = req.query;
        const queryRunner = getQueryRunner(req);

        const query = `
            SELECT 
                a.*,
                s.title as session_title,
                s.session_date,
                s.session_type
            FROM attendance a
            JOIN sessions s ON a.session_id = s.id
            WHERE a.member_id = $1
            ORDER BY s.session_date DESC
            LIMIT $2
        `;

        const result = await queryRunner(query, [memberId, parseInt(limit, 10)]);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
            history: result.rows
        });
    } catch (error) {
        console.error('Get attendance history error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMemberAttendance = exports.getMemberAttendanceHistory;

// Bulk update attendance
exports.bulkUpdateAttendance = async (req, res) => {
    try {
        const { session_id, records, default_status = 'present' } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!session_id) {
            return res.status(400).json({
                success: false,
                error: 'session_id is required'
            });
        }

        let toProcess = records;
        if (!toProcess || !Array.isArray(toProcess) || toProcess.length === 0) {
            const membersRes = await queryRunner(`
                SELECT id FROM members WHERE status = 'active' AND deleted_at IS NULL
            `);
            toProcess = membersRes.rows.map(m => ({
                member_id: m.id,
                status: default_status
            }));
        }

        const results = [];
        const errors = [];

        for (const record of toProcess) {
            try {
                const { member_id, status } = record;
                const checkInTime = (status === 'present' || status === 'late') ? new Date().toISOString() : null;

                const existing = await queryRunner(
                    'SELECT id FROM attendance WHERE member_id = $1 AND session_id = $2',
                    [member_id, session_id]
                );

                if (existing.rows.length > 0) {
                    const updated = await queryRunner(`
                        UPDATE attendance
                        SET status = $1, check_in_time = COALESCE($2, check_in_time), updated_at = CURRENT_TIMESTAMP
                        WHERE id = $3
                        RETURNING *
                    `, [status, checkInTime, existing.rows[0].id]);
                    results.push(updated.rows[0]);
                } else {
                    const inserted = await queryRunner(`
                        INSERT INTO attendance (member_id, session_id, status, check_in_time, updated_at)
                        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                        RETURNING *
                    `, [member_id, session_id, status, checkInTime]);
                    results.push(inserted.rows[0]);
                }
            } catch (error) {
                errors.push({
                    record,
                    error: error.message
                });
            }
        }

        res.json({
            success: errors.length === 0,
            message: `Processed ${results.length} records${errors.length > 0 ? `, ${errors.length} errors` : ''}`,
            processed: results.length,
            failed: errors.length,
            data: results,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('Bulk update attendance error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.bulkAttendance = exports.bulkUpdateAttendance;
