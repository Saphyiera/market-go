class Recipe {
    /**
     * @param {number} recipeId - Unique identifier for the recipe.
     * @param {number|null} userId - Unique identifier for the user who created the recipe (foreign key referencing `user` table).
     * @param {string|null} instructions - Step-by-step instructions for preparing the recipe.
     * @param {Buffer|null} recipeImg - Binary data for the recipe's image.
     * @param {string|null} recipeName - Name of the recipe.
     */
    constructor(recipeId, userId = null, instructions = null, recipeImg = null, recipeName = null) {
        this.recipeId = recipeId;
        this.userId = userId;
        this.instructions = instructions;
        this.recipeImg = recipeImg;
        this.recipeName = recipeName;
    }
}

module.exports = Recipe;
