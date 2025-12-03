const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken } = require('../utils/jwt');

const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded || decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = decoded;
  next();
};

router.post('/login', adminController.login);
router.get('/payments', requireAdmin, adminController.getPayments);
router.get('/payments/:paymentId', requireAdmin, adminController.getPaymentDetail);

// API Keys
router.post('/api-keys/generate', requireAdmin, adminController.generateApiKey);
router.get('/api-keys', requireAdmin, adminController.listApiKeys);
router.delete('/api-keys/:id', requireAdmin, adminController.revokeApiKey);
router.get('/stats', requireAdmin, adminController.getDashboardStats);
router.delete('/payments/clear', requireAdmin, adminController.clearHistory);

module.exports = router;
