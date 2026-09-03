const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/momo', paymentController.processMoMoPayment);
router.get('/', paymentController.getAllPayments);
router.post('/hubtel/callback', paymentController.handleHubtelCallback);
router.get('/hubtel/status', paymentController.getHubtelStatus);

module.exports = router;
