const express = require('express');
const {
  getProviders,
  getProvider,
  createProvider,
  updateProvider,
  deleteProvider,
  getMyProvider,
  updateMenu,
  updateWeeklyMenu,
  updatePricing,
  getNearbyProviders
} = require('../controllers/providerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

// Public routes
router.get('/', getProviders);
router.get('/nearby', getNearbyProviders);
router.get('/:id', getProvider);

// Protected routes - Provider only
router.use(protect);
router.get('/me/listing', authorize('provider', 'admin'), getMyProvider);
router.post('/', authorize('provider', 'admin'), createProvider);
router.put('/:id', authorize('provider', 'admin'), updateProvider);
router.delete('/:id', authorize('provider', 'admin'), deleteProvider);
router.put('/:id/menu', authorize('provider', 'admin'), updateMenu);
router.put('/:id/weekly-menu', authorize('provider', 'admin'), updateWeeklyMenu);
router.put('/:id/pricing', authorize('provider', 'admin'), updatePricing);

module.exports = router;