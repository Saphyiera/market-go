const DishPlanRepository = require('../repositories/dishplan');

class DishPlanService {
    constructor() {
        this.dishPlanRepository = new DishPlanRepository();
    }

    async getDishPlanDates(userId, month, year) {
        return await this.dishPlanRepository.getDishPlanDates(userId, month, year);
    }

    async getRecipesByDate(userId, dateToDo) {
        return await this.dishPlanRepository.getRecipesByDate(userId, dateToDo);
    }

    async addDishPlan(userId, dateToDo, recipeId) {
        return await this.dishPlanRepository.addDishPlan(userId, dateToDo, recipeId);
    }

    async deleteDishPlan(userId, dateToDo) {
        return await this.dishPlanRepository.deleteDishPlan(userId, dateToDo);
    }

    async deleteRecipesFromDishPlan(userId, dateToDo, recipeIds) {
        return await this.dishPlanRepository.deleteRecipesFromDishPlan(userId, dateToDo, recipeIds);
    }
}

module.exports = DishPlanService;
