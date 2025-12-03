const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create', paymentController.createPayment);
router.get('/:paymentId', paymentController.getPayment);
router.get('/status/:paymentId', paymentController.getPaymentStatus);
router.post('/mark-not-verified', paymentController.markNotVerified);
router.post('/verify', paymentController.verifyPayment);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
