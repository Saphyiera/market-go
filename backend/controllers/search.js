const SearchService = require('../services/search')

class SearchController {
    constructor() {
        this.searchService = new SearchService()
    }

    async findRecipes(req, res) {
        try {
            const { name, ingredientIds, ownerIds } = req.body;
            if (!name && !(Array.isArray(ingredientIds) && ingredientIds.length > 0) && !(Array.isArray(ownerIds) && ownerIds.length > 0)) {
                res.json({ status: 400, message: "Recipe name, ingredients, or owner ID required!" });
            } else {
                const result = await this.searchService.findRecipes(name, ingredientIds, ownerIds);
                res.json({ status: 200, data: result });
            }
        } catch (error) {
            res.json({ status: 500, message: error.message });
        }
    }

    async findUsers(req, res) {
        try {
            const { name, ids } = req.body;
            if (!name && !ids) {
                res.json({ Status: 400, message: "Name or ids not provided!" })
            }
            else {
                const result = await this.searchService.findUsers(name, ids);
                res.status(200).json({ data: result });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });

        }
    }
}

module.exports = SearchController