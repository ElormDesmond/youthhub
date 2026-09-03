const express = require('express');
const router = express.Router();
const financeController = require('../controllers/financeController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/dues', financeController.getDuesAndLevies);
router.post('/dues', authenticateToken, requireRole(['admin', 1]), financeController.createDuesRecord);
router.put('/dues/:id', authenticateToken, requireRole(['admin', 1]), financeController.updateDuesRecord);

module.exports = router;
