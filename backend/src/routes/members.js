// routes/members.js - Member API endpoints

const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

/**
 * GET /api/members/groups/list
 * Get all youth groups
 * Note: Placed before /:id to prevent routing collision
 */
router.get('/groups/list', memberController.getYouthGroups);
router.post('/bulk-import', memberController.bulkImportMembers);

/**
 * GET /api/members
 * Fetch all members with optional filtering
 * Query params: group_id, status, search
 */
router.get('/', memberController.getAllMembers);

/**
 * POST /api/members
 * Register a new member
 * Body: { first_name, last_name, email, phone_number, date_of_birth, youth_group_id, ... }
 */
router.post('/', memberController.createMember);

/**
 * GET /api/members/:id
 * Get details for a specific member
 */
router.get('/:id', memberController.getMemberById);

/**
 * PUT /api/members/:id
 * Update member details
 */
router.put('/:id', memberController.updateMember);

/**
 * DELETE /api/members/:id
 * Deactivate a member (soft delete)
 */
router.delete('/:id', memberController.deleteMember);

module.exports = router;
