const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', notificationController.getNotifications);
router.post('/', authenticateToken, requireRole(['admin', 1]), notificationController.createNotification);
router.put('/:id', authenticateToken, requireRole(['admin', 1]), notificationController.updateNotification);
router.delete('/:id', authenticateToken, requireRole(['admin', 1]), notificationController.deleteNotification);
router.post('/sync-weekly', authenticateToken, requireRole(['admin', 1]), notificationController.generateWeeklyScheduleAlerts);

module.exports = router;
