// ============ src/routes/paymentRoutes.js ============
const express = require('express');
const {
  createOrder,
  verifyPayment,
  getPaymentHistory
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { paymentLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

router.use(protect);

router.post('/create-order', paymentLimiter, createOrder);
router.post('/verify', paymentLimiter, verifyPayment);
router.get('/history', getPaymentHistory);

module.exports = router;

