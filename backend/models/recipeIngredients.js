class RecipeIngredients {
    /**
     * @param {number} recipeId - Unique identifier for the recipe (foreign key referencing `recipe` table).
     * @param {number} itemId - Unique identifier for the item (foreign key referencing `item` table).
     * @param {string|null} amount - Quantity or measurement of the ingredient.
     */
    constructor(recipeId, itemId, amount = null) {
        this.recipeId = recipeId;
        this.itemId = itemId;
        this.amount = amount;
    }
}

module.exports = RecipeIngredients;
