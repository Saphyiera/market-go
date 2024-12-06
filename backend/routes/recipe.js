const express = require('express')
const multer = require('multer')
const connection = require('../db/connection')
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function formatRecipes(data) {
    return data.map(item => ({
        ...item,
        RecipeImg: item.RecipeImg ? item.RecipeImg.toString('base64') : null,
    }))
}

function formatRecipe(data) {
    return {
        ...data,
        RecipeImg: data.RecipeImg ? data.RecipeImg.toString('base64') : null,
    };
}

router.post('/', upload.single('recipeImg'), (req, res) => {
    const { userId, recipeName, instructions } = req.body;
    const recipeImg = req.file ? req.file.buffer : null;

    connection.query('SELECT MAX(RecipeID) AS maxId FROM recipe', (err, result) => {
        if (err) {
            console.error('Error retrieving max RecipeID:', err);
            return res.sendStatus(500).send('Error retrieving recipe ID');
        }

        const maxId = result[0].maxId;
        const newRecipeId = maxId !== null ? maxId + 1 : 0;

        const insertQuery = `
            INSERT INTO recipe (RecipeID, UserID, RecipeImg, RecipeName, Instructions)
            VALUES (?, ?, ?, ?, ?)
        `;
        connection.query(insertQuery, [newRecipeId, userId, recipeImg, recipeName, instructions], (err) => {
            if (err) {
                console.error('Error adding recipe:', err);
                return res.json({ status: 500, message: "Something went wrong" });
            }
            res.json({ status: 200, recipeId: newRecipeId });
        });
    });
});

router.post('/update', upload.single('img'), (req, res) => {
    const { recipeId, instructions, name } = req.body;
    const updates = [];
    const values = [];

    if (req.file) {
        updates.push("RecipeImg = ?");
        values.push(req.file.buffer);
    }
    if (instructions) {
        updates.push("Instructions = ?");
        values.push(instructions);
    }
    if (name) {
        updates.push("RecipeName = ?");
        values.push(name);
    }

    if (updates.length === 0) {
        return res.json({ status: 400, message: "No fields to update" });
    }

    values.push(recipeId);
    console.log(values);
    const query = `UPDATE recipe SET ${updates.join(', ')} WHERE RecipeID = ?`;

    connection.query(query, values, (err) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            res.json({ status: 200, message: "Update successful" });
        }
    });
});

router.post('/ingredients', (req, res) => {
    const { recipeId, ingredients } = req.body;
    console.log(req.body);
    const values = ingredients.map((i) => [recipeId, i[0], i[1]]);
    console.log(values);

    connection.query(`
        INSERT INTO recipeingredients(RecipeID,ItemID,Amount)
        VALUES ? 
        ON DUPLICATE KEY UPDATE Amount = VALUES(Amount)`, [values], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err });
        } else {
            console.log(result);
            res.json({ status: 200, data: result });
        }
    });
});


router.delete('/ingredients', (req, res) => {
    const { recipeId, itemId } = req.body;

    if (!itemId || !recipeId) {
        return res.status(400).json({ status: 400, message: "Missing recipeId or itemId!" });
    }

    const placeholders = itemId.map(() => '(?, ?)').join(', ');
    const values = itemId.flatMap(i => [recipeId, i]);

    const query = `
        DELETE FROM recipeingredients
        WHERE (RecipeID, ItemID) IN (${placeholders})
    `;

    connection.query(query, values, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ status: 500, message: "Server Error!" });
        } else {
            res.status(200).json({ status: 200, message: "OK" });
        }
    });
});


router.get('/all', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    connection.query(
        'SELECT RecipeID, RecipeName, Username, RecipeImg FROM recipe INNER JOIN user ON recipe.UserID = user.UserID LIMIT ? OFFSET ?',
        [itemsPerPage, offset],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server Error" });
            } else {
                res.json({ status: 200, data: formatRecipes(result) });
            }
        }
    );
});

router.get('/', (req, res) => {
    const recipeId = req.query.RecipeID;

    connection.query(
        `SELECT 
        r.Instructions, 
        r.RecipeImg, 
        r.RecipeName, 
        u.Username,
        JSON_ARRAYAGG(JSON_OBJECT(
            'ItemID', i.ItemID, 
            'ItemName', i.ItemName, 
            'ItemImg', i.ItemImg, 
            'Amount', ri.Amount
            )) AS Ingredients
            FROM recipe r
            INNER JOIN recipeingredients ri ON r.RecipeID = ri.RecipeID
            INNER JOIN item i ON i.ItemID = ri.ItemID
            INNER JOIN user u ON u.UserID = r.UserID
            WHERE r.RecipeID = ?
            GROUP BY r.RecipeID`,
        [recipeId],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server Error" });
            } else if (result.length === 0) {
                res.json({ status: 404, message: "Recipe not found" });
            } else {
                res.json({ status: 200, data: formatRecipe(result[0]) });
            }
        }
    );
});

router.get('/v2', (req, res) => {
    const recipeId = req.query.RecipeID;

    connection.query(
        `SELECT 
            r.RecipeID,
            r.RecipeName, 
            r.RecipeImg, 
            r.Instructions, 
            u.Username
        FROM recipe r
        INNER JOIN user u ON u.UserID = r.UserID
        WHERE r.RecipeID = ?`,
        [recipeId],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json({ status: 500, message: "Server Error" });
            } else if (result.length === 0) {
                return res.json({ status: 404, message: "Recipe not found" });
            } else {
                console.log(result[0]);
                const recipe = {
                    ...result[0],
                    RecipeImg: result[0].RecipeImg ? result[0].RecipeImg.toString('base64') : null
                }

                connection.query(
                    `SELECT 
                        i.ItemID, 
                        i.ItemName, 
                        i.ItemImg, 
                        ri.Amount
                    FROM recipeingredients ri
                    INNER JOIN item i ON i.ItemID = ri.ItemID
                    WHERE ri.RecipeID = ?`,
                    [recipeId],
                    (err, ingredientsResult) => {
                        if (err) {
                            console.log(err);
                            return res.json({ status: 500, message: "Server Error" });
                        }
                        console.log("AAAA", ingredientsResult);

                        const formattedRecipe = {
                            ...recipe,
                            Ingredients: ingredientsResult.map((item) => {
                                return {
                                    ...item,
                                    ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null
                                }
                            })
                        };

                        res.json({ status: 200, data: formattedRecipe });
                    }
                );
            }
        }
    );
});


router.delete('/', (req, res) => {
    const { recipeId } = req.query;
    if (!recipeId) {
        return res.status(400).json({ status: 400, message: "Recipe ID is required" });
    }
    connection.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ status: 500, message: "Transaction start error", error: err });
        }
        connection.query(
            `DELETE FROM recipeingredients WHERE RecipeID = ?`, [recipeId],
            (err) => {
                if (err) {
                    return connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Error deleting from recipeingredients", error: err });
                    });
                }
                connection.query(
                    `DELETE FROM recipe WHERE RecipeID = ?`, [recipeId],
                    (err, result) => {
                        if (err) {
                            return connection.rollback(() => {
                                res.status(500).json({ status: 500, message: "Error deleting from recipe", error: err });
                            });
                        }
                        connection.commit((err) => {
                            if (err) {
                                return connection.rollback(() => {
                                    res.status(500).json({ status: 500, message: "Commit error", error: err });
                                });
                            }
                            res.json({ status: 200, message: "Recipe deleted successfully" });
                        });
                    }
                );
            }
        );
    });
});

router.get('/owner', (req, res) => {
    const userId = req.query.userId;
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    console.log(req.query);

    connection.query(`SELECT * FROM recipe WHERE UserID = ? LIMIT ? OFFSET ?`, [userId, itemsPerPage, offset], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            console.log(result);
            res.json({ status: 200, data: result });
        }
    })
})

module.exports = router;