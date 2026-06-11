// ============ src/routes/adminRoutes.js ============
const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  getPendingProviders,
  approveProvider,
  rejectProvider,
  toggleUserStatus,
  getReportedMessages,
  getReportedReviews,
  deleteReportedContent,
  getSubscriptionAnalytics
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

router.get('/providers/pending', getPendingProviders);
router.put('/providers/:id/approve', approveProvider);
router.put('/providers/:id/reject', rejectProvider);

router.get('/reports/messages', getReportedMessages);
router.get('/reports/reviews', getReportedReviews);
router.delete('/reports/:type/:id', deleteReportedContent);

router.get('/analytics/subscriptions', getSubscriptionAnalytics);

module.exports = router;