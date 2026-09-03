// routes/sessions.js - Session management endpoints

const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

/**
 * GET /api/sessions
 * Get all sessions with optional filtering
 * Query params: group_id, session_type, from_date, to_date
 */
router.get('/', sessionController.getAllSessions);

/**
 * POST /api/sessions
 * Create a new session/event
 * Body: { title, session_date, session_time, location, session_type, youth_group_id, ... }
 */
router.post('/', sessionController.createSession);

/**
 * GET /api/sessions/:id
 * Get details for a specific session
 */
router.get('/:id', sessionController.getSessionById);

/**
 * PUT /api/sessions/:id
 * Update session details
 */
router.put('/:id', sessionController.updateSession);

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', sessionController.deleteSession);

/**
 * GET /api/sessions/:id/summary
 * Get attendance summary for a session
 */
router.get('/:id/summary', sessionController.getSessionSummary);

module.exports = router;
