// Member Controller - Business logic for member management
const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

exports.getAllMembers = async (req, res) => {
    try {
        const { group_id, status, search } = req.query;
        const queryRunner = getQueryRunner(req);
        
        let query = `
            SELECT 
                m.*,
                yg.name as group_name,
                COUNT(DISTINCT a.id) as total_sessions,
                COUNT(DISTINCT CASE WHEN a.status = 'present' THEN a.id END) as sessions_present
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            LEFT JOIN attendance a ON m.id = a.member_id
            WHERE (m.deleted_at IS NULL)
        `;
        
        const params = [];
        let paramCount = 1;

        // Filter by group
        if (group_id) {
            query += ` AND m.youth_group_id = $${paramCount}`;
            params.push(parseInt(group_id, 10));
            paramCount++;
        }

        // Filter by status
        if (status) {
            query += ` AND m.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        } else {
            query += ` AND (m.status = 'active' OR m.status = 'graduated')`;
        }

        // Search by name
        if (search) {
            query += ` AND (m.first_name ILIKE $${paramCount} OR m.last_name ILIKE $${paramCount} OR m.phone_number ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ` GROUP BY m.id, yg.name ORDER BY m.first_name, m.last_name`;

        const result = await queryRunner(query, params);
        
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows,
            members: result.rows
        });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMembers = exports.getAllMembers;

exports.getMemberById = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        const memberQuery = `
            SELECT m.*, yg.name as group_name
            FROM members m
            LEFT JOIN youth_groups yg ON m.youth_group_id = yg.id
            WHERE m.id = $1 AND (m.deleted_at IS NULL)
        `;

        const memberResult = await queryRunner(memberQuery, [id]);

        if (memberResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found'
            });
        }

        // Get attendance history
        const attendanceQuery = `
            SELECT a.*, s.title as session_title, s.session_date
            FROM attendance a
            JOIN sessions s ON a.session_id = s.id
            WHERE a.member_id = $1
            ORDER BY s.session_date DESC
            LIMIT 20
        `;

        const attendanceResult = await queryRunner(attendanceQuery, [id]);

        res.json({
            success: true,
            member: memberResult.rows[0],
            data: memberResult.rows[0],
            recent_attendance: attendanceResult.rows
        });
    } catch (error) {
        console.error('Get member by ID error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.createMember = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            email,
            phone_number,
            date_of_birth,
            gender,
            guardian_name,
            guardian_phone,
            guardian_email,
            youth_group_id,
            notes
        } = req.body;
        const queryRunner = getQueryRunner(req);

        // Validation
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                error: 'First name and last name are required'
            });
        }

        const query = `
            INSERT INTO members (
                first_name, last_name, email, phone_number, date_of_birth,
                gender, guardian_name, guardian_phone, guardian_email,
                youth_group_id, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;

        const values = [
            first_name.trim(),
            last_name.trim(),
            email ? email.trim().toLowerCase() : null,
            phone_number ? phone_number.trim() : null,
            date_of_birth || null,
            gender || null,
            guardian_name ? guardian_name.trim() : null,
            guardian_phone ? guardian_phone.trim() : null,
            guardian_email ? guardian_email.trim().toLowerCase() : null,
            youth_group_id ? parseInt(youth_group_id, 10) : null,
            notes || null
        ];

        const result = await queryRunner(query, values);

        res.status(201).json({
            success: true,
            message: 'Member registered successfully',
            data: result.rows[0],
            member: result.rows[0]
        });
    } catch (error) {
        if (error.constraint === 'unique_member' || error.message?.includes('UNIQUE')) {
            return res.status(409).json({
                success: false,
                error: 'This member already exists in the system'
            });
        }
        console.error('Create member error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateMember = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;
        const queryRunner = getQueryRunner(req);

        // Allowed fields to update
        const allowedFields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'date_of_birth', 'gender', 'guardian_name', 'guardian_phone',
            'guardian_email', 'youth_group_id', 'status', 'notes'
        ];

        // Build dynamic query
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
            UPDATE members
            SET ${updateClauses.join(', ')}
            WHERE id = $${paramCount}
            RETURNING *
        `;

        values.push(id);

        const result = await queryRunner(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member updated successfully',
            data: result.rows[0],
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Update member error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteMember = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);

        // Soft delete by setting status to 'inactive'
        const query = `
            UPDATE members
            SET status = 'inactive', deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
            RETURNING *
        `;

        const result = await queryRunner(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Member not found'
            });
        }

        res.json({
            success: true,
            message: 'Member deactivated successfully',
            data: result.rows[0],
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Delete member error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get youth groups
exports.getYouthGroups = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                yg.*,
                COUNT(m.id) as member_count,
                u.first_name as leader_first_name,
                u.last_name as leader_last_name
            FROM youth_groups yg
            LEFT JOIN members m ON yg.id = m.youth_group_id AND m.status = 'active' AND m.deleted_at IS NULL
            LEFT JOIN users u ON yg.leader_id = u.id
            GROUP BY yg.id, u.first_name, u.last_name
            ORDER BY yg.name
        `;

        const result = await queryRunner(query);

        res.json({
            success: true,
            data: result.rows,
            groups: result.rows
        });
    } catch (error) {
        console.error('Get youth groups error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * POST /api/members/bulk-import
 * Batch import members from CSV, Excel, or image OCR text
 */
exports.bulkImportMembers = async (req, res) => {
    try {
        const { members = [] } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ success: false, error: 'No member records provided' });
        }

        let importedCount = 0;
        const errors = [];

        for (const m of members) {
            if (!m.first_name || !m.last_name) continue;

            try {
                const query = `
                    INSERT OR REPLACE INTO members (
                        first_name, last_name, email, phone_number, date_of_birth,
                        gender, guardian_name, guardian_phone, youth_group_id, status, notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `;

                await queryRunner(query, [
                    m.first_name.trim(),
                    m.last_name.trim(),
                    m.email ? m.email.trim().toLowerCase() : null,
                    m.phone_number || m.phone || null,
                    m.date_of_birth || m.dob || null,
                    m.gender ? m.gender.toUpperCase().slice(0, 1) : 'M',
                    m.guardian_name || null,
                    m.guardian_phone || null,
                    m.youth_group_id ? parseInt(m.youth_group_id, 10) : 2,
                    'active',
                    m.notes || 'Batch imported roster'
                ]);

                importedCount++;
            } catch (err) {
                errors.push(`${m.first_name} ${m.last_name}: ${err.message}`);
            }
        }

        res.status(201).json({
            success: true,
            message: `Successfully imported and enrolled ${importedCount} youth members!`,
            imported_count: importedCount,
            errors_count: errors.length,
            errors
        });
    } catch (err) {
        console.error('Bulk import error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};
