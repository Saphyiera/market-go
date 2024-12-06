const SearchRepository = require('../repositories/search')

class SearchService {
    constructor() {
        this.searchRepository = new SearchRepository();
    }
    formatRecipes(data) {
        return data.map(item => ({
            ...item,
            RecipeImg: item.RecipeImg ? item.RecipeImg.toString('base64') : null,
        }))
    }

    formatUserInfo(data) {
        return data.map(item => ({
            ...item,
            Avatar: item.Avatar ? item.Avatar.toString('base64') : null,
        }))
    }

    async findRecipes(name, ingredientIds, ownerIds) {
        let result;
        if (Array.isArray(ownerIds) && ownerIds.length > 0) {
            result = await this.searchRepository.findRecipesByOwners(ownerIds);
        } else if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
            result = await this.searchRepository.findRecipesByIngredients(ingredientIds);
        }
        else {
            result = await this.searchRepository.findRecipesByName(name)
        }
        return this.formatRecipes(result);

    }
    async findUsers(name, ids) {
        let result;
        if (name) {
            result = await this.searchRepository.findUsersByName(name);
        } else {
            result = await this.searchRepository.findUsersById(ids);
        }
        return this.formatUserInfo(result);
    }
}

module.exports = SearchService