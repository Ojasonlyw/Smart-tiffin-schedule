// ============ src/routes/subscriptionRoutes.js ============
const express = require('express');
const {
  createSubscription,
  getSubscriptions,
  getSubscription,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  getProviderSubscriptions
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.get('/provider/list', authorize('provider', 'admin'), getProviderSubscriptions);

router.route('/:id')
  .get(getSubscription);

router.put('/:id/cancel', cancelSubscription);
router.put('/:id/pause', pauseSubscription);
router.put('/:id/resume', resumeSubscription);

module.exports = router;

