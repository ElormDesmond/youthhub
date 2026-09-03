const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/gallery', mediaController.getGallery);
router.post('/gallery', authenticateToken, requireRole(['admin', 'media_team', 1, 2]), mediaController.addGalleryItem);
router.delete('/gallery/:id', authenticateToken, requireRole(['admin', 'media_team', 1, 2]), mediaController.deleteGalleryItem);

module.exports = router;
