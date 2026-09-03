const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Staff User & Role Management
router.get('/users', authenticateToken, adminController.getStaffUsers);
router.post('/users', authenticateToken, requireRole(['admin', 1]), adminController.createStaffUser);
router.put('/users/:id/role', authenticateToken, requireRole(['admin', 1]), adminController.updateUserRole);
router.delete('/users/:id', authenticateToken, requireRole(['admin', 1]), adminController.deleteStaffUser);

// Ministry Announcements & Updates
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements', authenticateToken, requireRole(['admin', 'media_team', 'volunteer', 1, 2, 4]), adminController.createAnnouncement);
router.delete('/announcements/:id', authenticateToken, requireRole(['admin', 'media_team', 1, 2]), adminController.deleteAnnouncement);

// Supervisor Audit & Comments
router.get('/comments', adminController.getSupervisorComments);
router.post('/comments', authenticateToken, requireRole(['admin', 1]), adminController.addSupervisorComment);

// Live Database Inspector
router.get('/db-overview', adminController.getDbOverview);

module.exports = router;
