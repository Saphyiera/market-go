class DishPlan {
    /**
     * @param {number} userId - Unique identifier for the user (foreign key referencing `user` table).
     * @param {number} recipeId - Unique identifier for the recipe (foreign key referencing `recipe` table).
     * @param {string} dateToDo - Date for the planned dish (in `YYYY-MM-DD` format).
     */
    constructor(userId, recipeId, dateToDo) {
        this.userId = userId;
        this.recipeId = recipeId;
        this.dateToDo = dateToDo;
    }
}

module.exports = DishPlan;
