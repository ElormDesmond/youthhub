const db = require('../db/database');

const getQueryRunner = (req) => {
    if (req?.app?.locals?.pool?.query) {
        return (q, p) => req.app.locals.pool.query(q, p);
    }
    return (q, p) => db.query(q, p);
};

// ============ AUTOMATED REMINDERS & NOTIFICATION SYSTEM ============

/**
 * Get active alerts & automated reminders
 */
exports.getNotifications = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const query = `
            SELECT * FROM notifications
            ORDER BY created_at DESC
            LIMIT 50
        `;

        const result = await queryRunner(query);

        res.json({
            success: true,
            count: result.rows.length,
            notifications: result.rows
        });
    } catch (err) {
        console.error('Get notifications error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Trigger / Schedule an automated reminder (Admin & System)
 */
exports.createNotification = async (req, res) => {
    try {
        const {
            title,
            event_name,
            message,
            description,
            first_reminder_time,
            last_reminder_time,
            reminder_type = 'custom_alert',
            target_date,
            target_time,
            channel = 'all'
        } = req.body;
        const queryRunner = getQueryRunner(req);

        const eventTitle = (title || event_name || 'Event Alert').trim();
        const alertMessage = (description || message || '').trim();

        if (!eventTitle || !alertMessage) {
            return res.status(400).json({ success: false, error: 'Event title and description are required' });
        }

        const firstTime = first_reminder_time || target_time || '06:00:00';
        const lastTime = last_reminder_time || '17:00:00';

        const query = `
            INSERT INTO notifications (
                title, event_name, message, reminder_type, target_date, target_time, 
                first_reminder_time, last_reminder_time, channel, is_sent
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
            RETURNING *
        `;

        const result = await queryRunner(query, [
            eventTitle,
            event_name || eventTitle,
            alertMessage,
            reminder_type,
            target_date || new Date().toISOString().slice(0, 10),
            firstTime,
            firstTime,
            lastTime,
            channel
        ]);

        res.status(201).json({
            success: true,
            message: 'Notification / Reminder broadcasted successfully',
            notification: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Update an existing automated reminder / alert (Admin)
 * Supports: event_name, title, message/description, first_reminder_time, last_reminder_time, target_date, channel
 */
exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            event_name,
            message,
            description,
            first_reminder_time,
            last_reminder_time,
            target_time,
            target_date,
            reminder_type,
            channel = 'all'
        } = req.body;

        const queryRunner = getQueryRunner(req);

        const eventTitle = (title || event_name || 'Event Alert').trim();
        const alertMessage = (description || message || '').trim();
        const firstTime = first_reminder_time || target_time || '06:00:00';
        const lastTime = last_reminder_time || '17:00:00';

        const updateQuery = `
            UPDATE notifications
            SET title = $1,
                event_name = $2,
                message = $3,
                first_reminder_time = $4,
                last_reminder_time = $5,
                target_time = $6,
                target_date = COALESCE($7, target_date),
                reminder_type = COALESCE($8, reminder_type),
                channel = $9
            WHERE id = $10
            RETURNING *
        `;

        const result = await queryRunner(updateQuery, [
            eventTitle,
            event_name || eventTitle,
            alertMessage,
            firstTime,
            lastTime,
            firstTime,
            target_date || new Date().toISOString().slice(0, 10),
            reminder_type || 'custom_alert',
            channel,
            id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Notification alert not found' });
        }

        res.json({
            success: true,
            message: 'Automated notification reminder updated successfully!',
            notification: result.rows[0]
        });
    } catch (err) {
        console.error('Update notification error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Delete a notification alert
 */
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const queryRunner = getQueryRunner(req);
        await queryRunner('DELETE FROM notifications WHERE id = $1', [id]);
        res.json({ success: true, message: 'Notification alert deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

/**
 * Generate standard automated schedule reminders
 */
exports.generateWeeklyScheduleAlerts = async (req, res) => {
    try {
        const queryRunner = getQueryRunner(req);
        const today = new Date().toISOString().slice(0, 10);

        const standardAlerts = [
            {
                title: '📅 Monday Youth Reminder',
                event_name: 'Tuesday Youth Fellowship',
                message: 'Beloved Global Evangelical Youth, remember our Tuesday Youth Fellowship tomorrow at 6:30 PM. Theme: Walking in Divine Purpose & Vision!',
                type: 'monday_tuesday_meeting',
                first_time: '06:00:00',
                last_time: '18:00:00'
            },
            {
                title: '⏰ Tuesday 5:00 PM Final Call',
                event_name: 'Tuesday Youth Fellowship (Live)',
                message: 'Final reminder: Youth Fellowship starts in 90 minutes (6:30 PM) in Fellowship Hall B. Bring a friend along!',
                type: 'tuesday_5pm_alert',
                first_time: '12:00:00',
                last_time: '17:00:00'
            },
            {
                title: '⛺ Youth Camp Retreat Countdown',
                event_name: 'Youth Mountain Retreat 2026',
                message: 'Camp countdown: Registration is underway! Pack your gear and secure your place for 3 life-transforming days.',
                type: 'event_week_prior',
                first_time: '07:00:00',
                last_time: '16:00:00'
            },
            {
                title: '🌅 Saturday 6:00 PM Sunday Service Alert',
                event_name: 'Sunday Divine Worship & Communion',
                message: 'Prepare for Sunday Worship tomorrow at Global Evangelical Church, Kasoa! 1st Service: 7:00 AM - 9:00 AM | 2nd Service: 9:30 AM - 12:00 PM.',
                type: 'saturday_6pm_service',
                first_time: '06:00:00',
                last_time: '18:00:00'
            }
        ];

        for (const alert of standardAlerts) {
            await queryRunner(`
                INSERT INTO notifications (
                    title, event_name, message, reminder_type, target_date, target_time, 
                    first_reminder_time, last_reminder_time, channel, is_sent
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'all', 1)
            `, [
                alert.title,
                alert.event_name,
                alert.message,
                alert.type,
                today,
                alert.first_time,
                alert.first_time,
                alert.last_time
            ]);
        }

        res.json({
            success: true,
            message: 'Automated weekly schedule reminders generated & synced successfully!'
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
