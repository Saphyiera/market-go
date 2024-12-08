const express = require('express')
const connection = require('../db/connection')
const router = express.Router();

router.get('/', (req, res) => {
    const userId = req.query.userId;
    const month = req.query.month;
    const year = req.query.year;

    const query = `
        SELECT DATE_FORMAT(DateToDo, '%Y-%m-%d') AS DateToDo
        FROM dishplan 
        WHERE dishplan.UserID = ? AND MONTH(DateToDo) = ? AND YEAR(DateToDo) = ?
        GROUP BY DateToDo
        ORDER BY DateToDo
        `;

    connection.query(query, [userId, month, year], (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send("Error retrieving dish plan");
        } else { }

        console.log(result);
        res.json({ status: 200, data: result });
    })
});

router.get('/date', (req, res) => {
    const { userId, dateToDo } = req.query;

    const query =
        `SELECT dishplan.RecipeID, RecipeName, TO_BASE64(RecipeImg) as RecipeImg
    FROM dishplan INNER JOIN recipe ON dishplan.RecipeID = recipe.RecipeID
    WHERE dishplan.UserID = ? AND DateToDo = ?
    `
    connection.query(query, [userId, dateToDo], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 500, message: "Server Error" });
        }
        else {
            res.json({ status: 200, data: result });
        }
    })
})

router.post('/', (req, res) => {
    const { userId, dateToDo, recipeId } = req.body;
    console.log(req.body);
    connection.query(`
        INSERT INTO dishplan(UserID, RecipeID, DateToDo) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE UserID = UserID`, [userId, recipeId, dateToDo], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server error" });
        } else {
            res.json({ status: 200, data: result.affectedRows });
        }
    })
})

router.delete('/', (req, res) => {
    const { userId, dateToDo } = req.body;
    connection.query('DELETE FROM dishplan WHERE UserID = ? AND DateToDo = ?', [userId, dateToDo], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            res.json({ status: 200, message: result });
        }
    })
})

router.delete('/recipe', (req, res) => {
    const { userId, dateToDo, recipeId } = req.body;
    console.log(req.body)

    connection.query('DELETE FROM dishplan WHERE UserID = ? AND DateToDo = ? AND RecipeID IN (?)', [userId, dateToDo, recipeId], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            console.log(result)
            res.json({ status: 200, message: result });
        }
    })
})

module.exports = router;