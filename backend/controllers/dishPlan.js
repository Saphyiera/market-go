const DishPlanService = require('../services/dishplan');

class DishPlanController {
    constructor() {
        this.dishPlanService = new DishPlanService();
    }

    async getDishPlanDates(req, res) {
        try {
            const userId = req.query.userId;
            const month = req.query.month;
            const year = req.query.year;

            const results = await this.dishPlanService.getDishPlanDates(userId, month, year);
            res.json({ status: 200, data: results });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async getRecipesByDate(req, res) {
        try {
            const { userId, dateToDo } = req.query;

            const recipes = await this.dishPlanService.getRecipesByDate(userId, dateToDo);
            res.json({ status: 200, data: recipes });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async addDishPlan(req, res) {
        try {
            const { userId, dateToDo, recipeId } = req.body;

            await this.dishPlanService.addDishPlan(userId, dateToDo, recipeId);
            res.json({ status: 200, message: "Dish plan added successfully" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async deleteDishPlan(req, res) {
        try {
            const { userId, dateToDo } = req.body;

            await this.dishPlanService.deleteDishPlan(userId, dateToDo);
            res.json({ status: 200, message: "Dish plan deleted successfully" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }

    async deleteRecipesFromDishPlan(req, res) {
        try {
            const { userId, dateToDo, recipeIds } = req.body;

            await this.dishPlanService.deleteRecipesFromDishPlan(userId, dateToDo, recipeIds);
            res.json({ status: 200, message: "Recipes deleted from dish plan successfully" });
        } catch (error) {
            return res.status(500).json({ status: 500, message: error.message });
        }
    }
}

module.exports = DishPlanController;
