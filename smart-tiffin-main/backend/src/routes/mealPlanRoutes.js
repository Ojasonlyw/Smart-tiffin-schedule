// ============ src/routes/mealPlanRoutes.js ============
const express = require('express');
const {
  createMealPlan,
  getMealPlans,
  getMealPlan,
  updateMealPlan,
  deleteMealPlan,
  toggleFavorite
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMealPlans)
  .post(createMealPlan);

router.route('/:id')
  .get(getMealPlan)
  .put(updateMealPlan)
  .delete(deleteMealPlan);

router.put('/:id/favorite', toggleFavorite);

module.exports = router;

