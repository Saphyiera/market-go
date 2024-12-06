class ISearch {
    findRecipesByName(name) {
        throw new Error("Method 'findRecipesByName' must be implemented!");
    }
    findRecipesByIngredients(ingredientIds) {
        throw new Error("Method 'findRecipesByIngredients' must be implemented!");
    }
    findRecipesByOwners(ownerIds) {
        throw new Error("Method 'findRecipesByOwners' must be implemented!");
    }
    findUsersByName(name) {
        throw new Error("Method 'findUsersByName' must be implemented!");
    }
    findUsersById(ids) {
        throw new Error("Method 'findUsersById' must be implemented!");
    }
}

module.exports = ISearch