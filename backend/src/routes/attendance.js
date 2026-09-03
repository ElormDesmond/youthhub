// routes/attendance.js - Attendance and check-in endpoints

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

/**
 * GET /api/attendance/session/:sessionId
 * Get all attendance records for a session with member details
 * Query params: group_id (optional filter)
 */
router.get('/session/:sessionId', attendanceController.getSessionAttendance);

/**
 * POST /api/attendance
 * Record or update attendance for a member in a session
 * Body: { member_id, session_id, status, check_in_time, notes }
 */
router.post('/', attendanceController.recordAttendance);

/**
 * PUT /api/attendance/:member_id/:session_id
 * Quick toggle/update status during check-in
 * Body: { new_status }
 */
router.put('/:member_id/:session_id', attendanceController.toggleAttendanceStatus);

/**
 * GET /api/attendance/member/:memberId
 * Get attendance history for a specific member
 * Query params: limit (default 50)
 */
router.get('/member/:memberId', attendanceController.getMemberAttendanceHistory);

/**
 * POST /api/attendance/bulk
 * Import/update multiple attendance records
 * Body: { session_id, records: [{ member_id, status }, ...] }
 */
router.post('/bulk', attendanceController.bulkUpdateAttendance);

module.exports = router;
