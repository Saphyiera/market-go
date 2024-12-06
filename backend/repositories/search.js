const ISearch = require('../interfaces/search')
const connection = require('../db/connection')

class SearchRepository extends ISearch {
    async findRecipesByName(name) {
        const keywords = name.trim().split(/\s+/);
        const conditions = keywords.map(() => `RecipeName LIKE ?`).join(' AND ');
        const queryParams = keywords.map((word) => `%${word}%`);
        const query = `SELECT RecipeID, Username, RecipeImg, RecipeName
                 FROM recipe r
                 INNER JOIN user u ON r.UserID = u.UserID
                 WHERE ${conditions}`;

        return new Promise((resolve, reject) => {
            connection.query(query, queryParams,
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        })
    }
    async findRecipesByIngredients(ingredientIds) {
        const query = `SELECT r.RecipeID, Username, RecipeImg, RecipeName, COUNT(ri.ItemID) AS MatchedIngredients
             FROM recipe r
             INNER JOIN user u ON r.UserID = u.UserID
             INNER JOIN recipeingredients ri ON ri.RecipeID = r.RecipeID
             WHERE ri.ItemID IN (?)
             GROUP BY r.RecipeID
             ORDER BY MatchedIngredients DESC`;
        return new Promise((resolve, reject) => {
            connection.query(query, [ingredientIds],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        })
    }
    async findRecipesByOwners(ownerIds) {
        const query = `SELECT RecipeID, Username, RecipeImg, RecipeName
             FROM recipe r
             INNER JOIN user u ON r.UserID = u.UserID
             WHERE r.UserID IN (?)`;
        return new Promise((resolve, reject) => {
            connection.query(query, [ownerIds],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        })
    }
    async findUsersByName(name) {
        const keywords = name.trim().split(/\s+/);
        const conditions = keywords.map(() => `Username LIKE ?`).join(' AND ');
        const queryParams = keywords.map((word) => `%${word}%`);
        const query = `SELECT * FROM user WHERE ${conditions}`
        return new Promise((resolve, reject) => {
            connection.query(query, queryParams,
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(result)
                        resolve(result);
                    }
                }
            );
        })
    }
    async findUsersById(ids) {
        const query = 'SELECT * FROM user WHERE UserID IN (?)';
        return new Promise((resolve, reject) => {
            connection.query(query, [ids],
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        })
    }
}

module.exports = SearchRepository