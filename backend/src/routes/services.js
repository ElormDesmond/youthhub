const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', serviceController.getSundayService);
router.put('/', authenticateToken, requireRole(['admin', 1]), serviceController.updateSundayService);

module.exports = router;
