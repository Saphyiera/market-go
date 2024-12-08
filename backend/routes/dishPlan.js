const express = require('express')
const DishPlanController = require('../controllers/dishPlan');

const dishPlanController = new DishPlanController();
const router = express.Router();

router.get('/', (req, res) => dishPlanController.getDishPlanDates(req, res));
router.get('/date', (req, res) => dishPlanController.getRecipesByDate(req, res));
router.post('/', (req, res) => dishPlanController.addDishPlan(req, res));
router.delete('/', (req, res) => dishPlanController.deleteDishPlan(req, res));
router.delete('/recipe', (req, res) => dishPlanController.deleteRecipesFromDishPlan(req, res));

module.exports = router;