const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

// ============ DUES & LEVIES FINANCIAL TRANSPARENCY ============

/**
 * Get all dues and levies records with totals
 */
exports.getDuesAndLevies = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT 
                d.*,
                u.first_name as recorder_first_name,
                u.last_name as recorder_last_name
            FROM dues_and_levies d
            LEFT JOIN users u ON d.recorded_by = u.id
            ORDER BY d.created_at DESC
        `;

        const result = await queryRunner(query);

        // Calculate transparency summary totals
        let totalTarget = 0;
        let totalCollected = 0;
        let totalDisbursed = 0;

        result.rows.forEach(row => {
            totalTarget += parseFloat(row.amount_target) || 0;
            totalCollected += parseFloat(row.amount_collected) || 0;
            totalDisbursed += parseFloat(row.amount_disbursed) || 0;
        });

        const netBalance = totalCollected - totalDisbursed;
        const fundingProgress = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 100;

        res.json({
            success: true,
            summary: {
                total_target: totalTarget,
                total_collected: totalCollected,
                total_disbursed: totalDisbursed,
                net_balance: netBalance,
                funding_progress: fundingProgress,
                active_campaigns_count: result.rows.length
            },
            dues: result.rows
        });
    } catch (err) {
        console.error('Get dues error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Record / Create a new dues campaign or levy report
 */
exports.createDuesRecord = async (req, res) => {
    try {
        const { title, category = 'monthly_dues', amount_target = 0, amount_collected = 0, amount_disbursed = 0, purpose, period, status = 'open' } = req.body;
        const queryRunner = getQueryRunner(req);

        if (!title) {
            return res.status(400).json({ success: false, error: 'Title is required' });
        }

        const query = `
            INSERT INTO dues_and_levies (title, category, amount_target, amount_collected, amount_disbursed, purpose, period, status, recorded_by, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const result = await queryRunner(query, [
            title.trim(),
            category,
            parseFloat(amount_target) || 0,
            parseFloat(amount_collected) || 0,
            parseFloat(amount_disbursed) || 0,
            purpose || null,
            period || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            status,
            req.user ? req.user.id : 1
        ]);

        res.status(201).json({
            success: true,
            message: 'Financial transparency report created successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update collected / disbursed funds
 */
exports.updateDuesRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount_collected, amount_disbursed, status, purpose } = req.body;
        const queryRunner = getQueryRunner(req);

        const query = `
            UPDATE dues_and_levies SET
                amount_collected = COALESCE($1, amount_collected),
                amount_disbursed = COALESCE($2, amount_disbursed),
                status = COALESCE($3, status),
                purpose = COALESCE($4, purpose),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;

        const result = await queryRunner(query, [
            amount_collected !== undefined ? parseFloat(amount_collected) : null,
            amount_disbursed !== undefined ? parseFloat(amount_disbursed) : null,
            status || null,
            purpose || null,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Dues record not found' });
        }

        res.json({
            success: true,
            message: 'Dues updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
