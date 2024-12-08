const connection = require('../db/connection');
const IDishPlan = require('../interfaces/dishplan');

class DishPlanRepository extends IDishPlan {
    getDishPlanDates(userId, month, year) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT DATE_FORMAT(DateToDo, '%Y-%m-%d') AS DateToDo
                FROM dishplan 
                WHERE dishplan.UserID = ? AND MONTH(DateToDo) = ? AND YEAR(DateToDo) = ?
                GROUP BY DateToDo
                ORDER BY DateToDo
            `;
            connection.query(query, [userId, month, year], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    getRecipesByDate(userId, dateToDo) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT dishplan.RecipeID, RecipeName, TO_BASE64(RecipeImg) as RecipeImg
                FROM dishplan 
                INNER JOIN recipe ON dishplan.RecipeID = recipe.RecipeID
                WHERE dishplan.UserID = ? AND DateToDo = ?
            `;
            connection.query(query, [userId, dateToDo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    addDishPlan(userId, dateToDo, recipeId) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO dishplan (UserID, RecipeID, DateToDo) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE UserID = UserID
            `;
            connection.query(query, [userId, recipeId, dateToDo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }

    deleteDishPlan(userId, dateToDo) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM dishplan WHERE UserID = ? AND DateToDo = ?`;
            connection.query(query, [userId, dateToDo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }

    deleteRecipesFromDishPlan(userId, dateToDo, recipeIds) {
        return new Promise((resolve, reject) => {
            const query = `
                DELETE FROM dishplan 
                WHERE UserID = ? AND DateToDo = ? AND RecipeID IN (?)
            `;
            connection.query(query, [userId, dateToDo, recipeIds], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.affectedRows > 0);
                }
            });
        });
    }
}

module.exports = DishPlanRepository;