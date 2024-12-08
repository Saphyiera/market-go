class IDishPlan {
    getDishPlansByMonth(userId, month, year) {
        throw new Error("Method 'getDishPlansByMonth' must be implemented!");
    }
    getRecipesByDate(userId, dateToDo) {
        throw new Error("Method 'getRecipesByDate' must be implemented!");
    }
    addRecipe(userId, dateToDo, recipeId) {
        throw new Error("Method 'addRecipe' must be implemented!");
    }
    deleteDishPlanByDate(userId, dateToDo) {
        throw new Error("Method 'deleteDishPlanByDate' must be implemented!");
    }
    deleteRecipeFromDishPlan(userId, dateToDo, recipeIds) {
        throw new Error("Method 'deleteRecipeFromDishPlan' must be implemented!");
    }
}

module.exports = IDishPlan;