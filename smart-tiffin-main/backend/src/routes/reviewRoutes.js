// ============ src/routes/reviewRoutes.js ============
const express = require('express');
const {
  createReview,
  getProviderReviews,
  updateReview,
  deleteReview,
  markHelpful,
  addProviderResponse
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/provider/:providerId', getProviderReviews);

// Protected routes
router.use(protect);
router.post('/', createReview);
router.put('/:id', updateReview);
router.delete('/:id', deleteReview);
router.put('/:id/helpful', markHelpful);
router.put('/:id/response', authorize('provider', 'admin'), addProviderResponse);

module.exports = router;

