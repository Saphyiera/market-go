const express = require('express')
const multer = require('multer')
const { formatPlans, formatFridgeItems, formatRecipes, formatRecipe, formatItem, formatUserInfo } = require('./middleware/middleware')
const cors = require('cors')
const connection = require('./db/connection')

const userRouter = require('./routes/user')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express()
app.use(express.json())
app.use(cors())

app.listen(port = 2811, () => {
    console.log(`Server is listening on http:/localhost:${port}`)
})

app.use('/user', userRouter);

app.get('/daily-list/month', (req, res) => {
    const userId = req.query.userId;
    const month = req.query.month;
    const year = req.query.year;

    connection.query(
        `SELECT dl.ListID, dl.DateToBuy, i.ItemName, li.Amount 
         FROM dailylist AS dl 
         INNER JOIN listitem AS li ON dl.ListID = li.ListID 
         INNER JOIN item AS i ON li.ItemID = i.ItemID 
         WHERE dl.UserID = ? AND YEAR(dl.DateToBuy) = ? AND MONTH(dl.DateToBuy) = ?`,
        [userId, year, month],
        (err, result) => {
            if (err) {
                res.status(500).send();
            } else {
                processedRes = formatPlans(result);
                console.log(processedRes);
                res.status(200).json(processedRes);
            }
        }
    );
});


app.get('/daily-list/next-30-days', (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ status: 400, message: "UserID is required" });
    }

    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    connection.query(
        `SELECT dl.DateToBuy, dl.Cost,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'ListID', dl.ListID,
                        'ItemID', li.ItemID,
                        'Amount', li.Amount,
                        'ItemName', i.ItemName
                    )
                ) AS Items
         FROM dailylist dl 
         INNER JOIN listitem li ON dl.ListID = li.ListID
         INNER JOIN item i ON li.ItemID = i.ItemID
         WHERE UserID = ? AND dl.DateToBuy BETWEEN ? AND ?
         GROUP BY dl.DateToBuy, dl.Cost`,
        [userId, today.toISOString().split('T')[0], next30Days.toISOString().split('T')[0]],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, message: "Server Error" });
            } else {
                res.json({ status: 200, data: result });
            }
        }
    );
});

app.get('/daily-list/all', (req, res) => {
    const { userId, page = 1, limit = 10 } = req.query;

    if (!userId) {
        return res.status(400).json({ status: 400, error: "Bad Request", message: "UserID is required" });
    }

    const offset = (page - 1) * parseInt(limit);

    connection.query(
        `SELECT dl.DateToBuy, 
                dl.Cost, 
                dl.ListID,
                GROUP_CONCAT(
                    JSON_OBJECT(
                        'ItemID', li.ItemID, 
                        'ItemName', i.ItemName, 
                        'Amount', li.Amount
                    )
                ) AS Items
         FROM dailylist dl
         INNER JOIN listitem li ON dl.ListID = li.ListID
         INNER JOIN item i ON li.ItemID = i.ItemID
         WHERE UserID = ?
         GROUP BY dl.DateToBuy, dl.Cost,dl.ListID
         ORDER BY dl.DateToBuy DESC
         LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), offset],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ status: 500, error: "Internal Server Error", message: "Server Error" });
            } else if (result.length === 0) {
                res.status(404).json({ status: 404, error: "Not Found", message: "No daily lists found for this user." });
            } else {
                const formattedResult = result.map(row => ({
                    ListID: row.ListID,
                    DateToBuy: row.DateToBuy,
                    Cost: row.Cost,
                    Items: JSON.parse(`[${row.Items}]`),
                }));
                res.json({ status: 200, data: formattedResult });
            }
        }
    );
});

app.get('/daily-list', (req, res) => {
    const { listId } = req.query;

    connection.query(
        `SELECT 
            dl.Cost, dl.DateToBuy,
            GROUP_CONCAT(li.ItemID) AS ItemIDs,
            GROUP_CONCAT(li.Amount) AS Amounts,
            GROUP_CONCAT(i.ItemName) AS ItemNames,
            GROUP_CONCAT(IFNULL(TO_BASE64(i.ItemImg), '')) AS ItemImgs
        FROM dailylist dl
        INNER JOIN listitem li ON dl.ListID = li.ListID
        INNER JOIN item i ON li.ItemID = i.ItemID
        WHERE dl.ListID = ?
        GROUP BY dl.ListID, dl.Cost, dl.DateToBuy`,
        [listId],
        (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: "Server error" });
            }
            else if (result.length > 0) {
                const { Cost, DateToBuy, ItemIDs, Amounts, ItemNames, ItemImgs } = result[0];

                const items = ItemIDs.split(',').map((id, index) => ({
                    ItemID: id,
                    Amount: Amounts.split(',')[index],
                    ItemName: ItemNames.split(',')[index],
                    ItemImg: ItemImgs.split(',')[index] ? ItemImgs.split(',')[index] : null
                }));

                res.json({
                    status: 200,
                    data: { Cost, DateToBuy, Items: items }
                });
            } else {
                res.json({ status: 404, message: "List not found" });
            }
        }
    );
});

app.post('/daily-list', (req, res) => {
    const { listItems, dateToBuy, userId, cost } = req.body;
    let listId;

    connection.query('SELECT MAX(ListID) AS maxListID FROM dailylist', (err, result) => {
        if (err) {
            return res.status(500).send('Error fetching max ListID');
        }

        listId = (result[0].maxListID || 0) + 1;

        connection.query(
            'INSERT INTO dailylist (ListID, UserID, DateToBuy, Cost) VALUES (?, ?, ?, ?)',
            [listId, userId, dateToBuy, cost],
            (err) => {
                if (err) {
                    return res.status(500).send('Error inserting into dailylist');
                }

                const listItemValues = listItems.map(item => [listId, item.ItemID, item.amount]);

                connection.query(
                    'INSERT INTO listitem (ListID, ItemID, Amount) VALUES ?',
                    [listItemValues],
                    (err) => {
                        if (err) {
                            return res.status(500).send('Error inserting into listitem');
                        }
                        res.status(200).send({ message: 'Items added successfully' });
                    }
                );
            }
        );
    });
});


app.put('/daily-list', (req, res) => { // Update plan
    const { dateToBuy, itemName, newAmount } = req.body;

    if (!dateToBuy || !itemName || !newAmount) {
        return res.status(400).json({ status: 400, message: "dateToBuy, itemName, and newAmount are required" });
    }

    // Truy vấn cập nhật amount bằng cách nối bảng
    const query = `
        UPDATE listitem li
        INNER JOIN dailylist dl ON li.ListID = dl.ListID
        INNER JOIN item i ON li.ItemID = i.ItemID
        SET li.Amount = ?
        WHERE dl.DateToBuy = ? AND i.ItemName = ?;
    `;

    connection.query(
        query,
        [newAmount, dateToBuy, itemName],
        (err, result) => {
            if (err) {
                console.error('Error updating list item amount:', err);
                return res.status(500).json({ status: 500, message: 'Error updating list item amount' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ status: 404, message: "No matching list item found" });
            }

            res.status(200).json({ status: 200, message: 'List item amount updated successfully' });
        }
    );
});

app.post('/item', upload.single('image'), (req, res) => {
    const { itemName, itemDescription } = req.body;
    const itemImage = req.file.buffer;

    connection.query('SELECT MAX(ItemID) AS maxId FROM item', (err, result) => {
        if (err) {
            console.error('Error retrieving max ItemID:', err);
            return res.status(500).send('Error retrieving item ID');
        }

        const maxId = result[0].maxId;
        const newItemId = maxId !== null ? maxId + 1 : 0;

        connection.query(
            'INSERT INTO item (ItemID, ItemName, ItemDescription, ItemImg) VALUES (?, ?, ?, ?)',
            [newItemId, itemName, itemDescription, itemImage],
            (err) => {
                if (err) {
                    console.error('Error adding item:', err);
                    return res.status(500).send('Error adding item');
                }
                res.status(200).send('Item added successfully');
            }
        );
    });
});

app.get('/item', (req, res) => {
    const { id, name } = req.query;

    let query = '';
    let params = [];

    if (id) {
        query = 'SELECT * FROM item WHERE ItemID = ?';
        params = [id];
    } else if (name) {
        const nameParts = name.toLowerCase().split(' ');
        const likeConditions = nameParts.map(() => `LOWER(ItemName) LIKE ?`).join(' OR ');

        query = `SELECT * FROM item WHERE ${likeConditions}`;
        params = nameParts.map(part => `%${part}%`);
    } else {
        return res.json({ status: 400, message: "No params: id or name" });
    }

    connection.query(query, params, (err, results) => {
        if (err || results.length === 0) {
            return res.json({ status: 404, message: "Not found item" });
        }
        console.log(results);
        res.json({ status: 200, data: formatItem(results) });
    });
});

app.get('/item/all', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    connection.query('SELECT ItemID, ItemName, ItemDescription, ItemImg FROM item LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving items');
        }

        const itemsWithImages = results.map(item => ({
            ...item,
            ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
        }));

        connection.query('SELECT COUNT(*) AS total FROM item', (err, countResult) => {
            if (err) {
                return res.status(500).send('Error retrieving total item count');
            }

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            res.json({
                items: itemsWithImages,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalItems: totalItems,
                },
            });
        });
    });
});

app.get('/fridge', (req, res) => {
    const userId = parseInt(req.query.UserID, 10);
    if (isNaN(userId)) {
        return res.json({ status: 400, message: "Invalid UserID" });
    }

    connection.query(
        `SELECT fridge.ItemID, ExpireDate, Amount, ItemName, ItemDescription, ItemImg
         FROM fridge INNER JOIN item ON fridge.ItemID = item.ItemID
         WHERE UserID = ?`, [userId],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server error" });
            } else if (result.length === 0) {
                res.json({ status: 404, message: "No items found" });
            } else {
                res.json({ status: 200, data: formatFridgeItems(result) });
            }
        });
});

app.delete('/fridge/all', (req, res) => {
    const userId = parseInt(req.query.UserID, 10);
    if (isNaN(userId)) {
        return res.json({ status: 400, message: "Invalid UserID" });
    };
    connection.query(
        `DELETE FROM fridge WHERE UserID = ?`, [userId],
        (err) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server Error!" });
            }
            else {
                res.json({ status: 200, message: "OK!" });
            }
        })
})

app.delete('/fridge/item', (req, res) => {
    const userId = parseInt(req.query.UserID, 10);
    const itemId = parseInt(req.query.ItemID, 10);

    if (isNaN(userId) || isNaN(itemId)) {
        return res.json({ status: 400, message: "Invalid UserID or ItemID" });
    }

    connection.query(
        `DELETE FROM fridge WHERE UserID = ? AND ItemID = ?`, [userId, itemId],
        (err) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server Error!" });
            } else {
                res.json({ status: 200, message: "Item deleted successfully" });
            }
        }
    );
});

app.post('/fridge/item', (req, res) => {
    const { itemId, userId, expireDate, amount } = req.body;
    console.log(req.body);

    const query = `
        INSERT INTO fridge (ItemID, UserID, ExpireDate, Amount)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            Amount = VALUES(Amount)
    `;

    connection.query(query, [itemId, userId, expireDate, amount], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server error" });
        } else {
            if (result.affectedRows > 0) {
                res.json({ status: 200, message: "Row inserted or updated successfully" });
            } else {
                res.json({ status: 404, message: "Row not found and not inserted" });
            }
        }
    });
});

app.post('/recipe', upload.single('recipeImg'), (req, res) => {
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

app.post('/recipe/update', upload.single('img'), (req, res) => {
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

app.post('/recipe/ingredients', (req, res) => {
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


app.delete('/recipe/ingredients', (req, res) => {
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


app.get('/recipe/all', (req, res) => {
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

app.get('/recipe', (req, res) => {
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

app.get('/v2/recipe', (req, res) => {
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


app.delete('/recipe', (req, res) => {
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

app.get('/recipe/owner', (req, res) => {
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

app.get('/dish-plan', (req, res) => {
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

app.get('/dish-plan/date', (req, res) => {
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

app.post('/dish-plan', (req, res) => {
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

app.delete('/dish-plan', (req, res) => {
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

app.delete('/dish-plan/recipe', (req, res) => {
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

app.get('/group-list', (req, res) => {
    const { listId, groupId } = req.query;
    connection.query(`
        SELECT gl.GroupID, gl.BuyerID, gl.ListID, CONVERT_TZ(dl.DateToBuy, '+00:00', '+07:00') AS DateToBuy, dl.Cost, li.ItemID, li.Amount, i.ItemName, i.ItemImg, u.Username
        FROM grouplist gl
        INNER JOIN dailylist dl ON gl.ListID = dl.ListID
        INNER JOIN listitem li ON li.ListId = dl.ListID
        INNER JOIN item i ON i.ItemID = li.ItemID
        INNER JOIN user u ON u.UserID = gl.BuyerID
        WHERE gl.ListID = ? AND gl.GroupID = ?
    `, [listId, groupId], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error!" });
            return;
        }
        if (result.length === 0) {
            res.json({ status: 404, message: "List not found!" });
            return;
        }
        const formattedData = result.reduce((res, cur) => {
            if (!res.Items.some(item => item.ItemID === cur.ItemID)) {
                res.Items.push({
                    ItemID: cur.ItemID,
                    Amount: cur.Amount,
                    ItemName: cur.ItemName,
                    ItemImg: cur.ItemImg ? cur.ItemImg.toString('base64') : null,
                });
            }
            if (!res.Buyers.some(buyer => buyer.BuyerID === cur.BuyerID)) {
                res.Buyers.push({
                    BuyerID: cur.BuyerID,
                    Username: cur.Username,
                });
            }

            return res;
        }, {
            GroupID: result[0].GroupID,
            ListID: result[0].ListID,
            Cost: result[0].Cost,
            DateToBuy: result[0].DateToBuy.toISOString().split('T')[0],
            Items: [],
            Buyers: []
        });
        console.log(formattedData);
        res.json({ status: 200, message: "OK", data: formattedData });
    });
});


app.post('/group-list/share', (req, res) => {
    const { listId, groupId, userId } = req.body;
    const values = [groupId, listId, userId];
    connection.query(
        `INSERT INTO grouplist(GroupID,ListID,BuyerID) VALUES (?) ON DUPLICATE KEY UPDATE BuyerID = VALUES(BuyerID)`, [values], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({ status: 500, message: "Server Error!" });
            } else {
                res.json({ status: 200, data: result });
            }
        }
    );
})

app.post('/group-list/buyers', (req, res) => {
    const { groupId, listId, buyerIds } = req.body;
    const values = buyerIds.map((i) => [groupId, listId, i]);

    connection.beginTransaction((err) => {
        if (err) {
            console.error(err);
            return res.json({ status: 500, message: "Server Error" });
        }
        connection.query(
            'DELETE FROM grouplist WHERE GroupID = ? AND ListID = ?',
            [groupId, listId],
            (deleteErr) => {
                if (deleteErr) {
                    return connection.rollback(() => {
                        console.error(deleteErr);
                        res.json({ status: 500, message: "Server Error" });
                    });
                }
                connection.query(
                    'INSERT INTO grouplist (GroupID, ListID, BuyerID) VALUES ?',
                    [values],
                    (insertErr, result) => {
                        if (insertErr) {
                            return connection.rollback(() => {
                                console.error(insertErr);
                                res.json({ status: 500, message: "Server Error" });
                            });
                        }
                        connection.commit((commitErr) => {
                            if (commitErr) {
                                return connection.rollback(() => {
                                    console.error(commitErr);
                                    res.json({ status: 500, message: "Server Error" });
                                });
                            }
                            res.json({ status: 200, message: "OK" });
                        });
                    }
                );
            }
        );
    });
});

app.post('/group/create', (req, res) => {
    const { groupName, adminId } = req.body;
    connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error("Transaction error: ", transactionErr);
            res.status(500).json({ status: 500, message: "Server Error" });
            return;
        }
        connection.query(`SELECT IFNULL(MAX(GroupID), 0) AS maxGroupId FROM \`group\``, (selectErr, selectResult) => {
            if (selectErr) {
                console.error("Error fetching max GroupID: ", selectErr);
                connection.rollback(() =>
                    res.status(500).json({ status: 500, message: "Server Error" })
                );
                return;
            }
            const groupId = selectResult[0].maxGroupId + 1;
            connection.query(
                `INSERT INTO \`group\` (GroupID, GroupName, AdminID) VALUES (?, ?, ?)`,
                [groupId, groupName, adminId],
                (insertErr) => {
                    if (insertErr) {
                        console.error("Error inserting new group: ", insertErr);
                        connection.rollback(() =>
                            res.status(500).json({ status: 500, message: "Server Error" })
                        );
                        return;
                    }
                    connection.query(`INSERT INTO groupmember(GroupID,MemberID) VALUES (?,?)`, [groupId, adminId], (gmInsertErr) => {
                        if (gmInsertErr) {
                            console.error("Error inserting new group member: ", gmInsertErr);
                            connection.rollback(() =>
                                res.status(500).json({ status: 500, message: "Server Error" })
                            );
                        } else {
                            connection.commit((commitErr) => {
                                if (commitErr) {
                                    console.error("Commit error: ", commitErr);
                                    connection.rollback(() =>
                                        res.status(500).json({ status: 500, message: "Server Error" })
                                    );
                                    return;
                                }
                                res.status(200).json({ status: 200, message: "Group created successfully", groupId });
                            });
                        }
                    })
                }
            );
        });
    });
});

app.get('/group/user', (req, res) => {
    const userId = req.query.userId;
    console.log(typeof userId);
    if (userId == "null") {
        res.json({ status: 400, message: "Invalid UserID" });
        return;
    }
    connection.query(
        `SELECT gm.GroupID, g.GroupName, g.AdminID, g.GroupImg, u.Username
         FROM groupmember gm 
         INNER JOIN \`group\` g ON gm.GroupID = g.GroupID
         INNER JOIN \`user\` u ON g.AdminID = u.UserID
         WHERE gm.MemberID = ?`, [userId],
        (err, result) => {
            if (err) {
                console.log(err);
                res.json({ status: 500, message: "Server error!" });
            }
            else if (result.length == 0) {
                res.json({ status: 404, message: "No group with this userid" });
            }
            else {
                console.log(result);
                res.json({ status: 200, data: result });
            }
        })
});

app.post('/group/avatar', upload.single('groupimg'), (req, res) => {
    const groupId = req.body.groupId;
    const groupImg = req.file.buffer;

    connection.query(
        `UPDATE \`group\` SET GroupImg = ? WHERE GroupID = ?`,
        [groupImg, groupId],
        (err, result) => {
            if (err) {
                console.log("Error inserting image:", err);
                return res.json({ status: 500, message: "Failed to upload image" });
            }
            res.json({ status: 200, message: "Image uploaded successfully" });
        }
    );
});

app.get('/group/details', (req, res) => {
    const groupId = req.query.groupId;
    connection.query(
        `SELECT 
            g.GroupID, g.AdminID, g.GroupName, 
            IFNULL(TO_BASE64(g.GroupImg), '') AS GroupImg,
            GROUP_CONCAT(gm.MemberID) AS MemberIDs,
            GROUP_CONCAT(u.Username) AS Usernames,
            JSON_ARRAYAGG(JSON_OBJECT(
                'Avatar', u.Avatar
            )) AS MemberAvatars
        FROM \`group\` g
        INNER JOIN groupmember gm ON g.GroupID = gm.GroupID
        INNER JOIN \`user\` u ON u.UserID = gm.MemberID
        WHERE g.GroupID = ?
        GROUP BY g.GroupID, g.AdminID, g.GroupName, g.GroupImg`,
        [groupId],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.json({ status: 500, message: "An unexpected error occurred" });
            }

            if (result.length === 0) {
                return res.json({ status: 404, message: "Group not found" });
            }

            const groupDetails = {
                GroupID: result[0].GroupID,
                AdminID: result[0].AdminID,
                GroupName: result[0].GroupName,
                GroupImg: result[0].GroupImg || null,
                Members: []
            };

            const memberIds = result[0].MemberIDs ? result[0].MemberIDs.split(',') : [];
            const usernames = result[0].Usernames ? result[0].Usernames.split(',') : [];
            const memberAvatars = result[0].MemberAvatars;

            if (memberIds.length === usernames.length) {
                for (let i = 0; i < memberIds.length; i++) {
                    groupDetails.Members.push({
                        MemberID: memberIds[i],
                        Username: usernames[i],
                        MemberAvatar: memberAvatars[i]?.Avatar || null
                    });
                }
            }
            res.json({ status: 200, data: groupDetails });
        }
    );
});

app.get('/group/plans', (req, res) => {
    const { groupId, month, year } = req.query;

    connection.query(
        `SELECT 
            gl.ListID, dl.DateToBuy,
            GROUP_CONCAT(gl.BuyerID) AS BuyerIDs,
            GROUP_CONCAT(u.Username) AS Usernames
        FROM grouplist gl
        INNER JOIN dailylist dl ON gl.ListID = dl.ListID
        INNER JOIN \`user\` u ON gl.BuyerID = u.UserID
        WHERE gl.GroupID = ? 
            AND YEAR(dl.DateToBuy) = ? 
            AND MONTH(dl.DateToBuy) = ?
        GROUP BY gl.ListID, dl.DateToBuy`,
        [groupId, year, month],
        (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: "Server error" });
            } else {
                const formattedResult = result.map(item => ({
                    ListID: item.ListID,
                    DateToBuy: item.DateToBuy,
                    Buyers: item.BuyerIDs.split(',').map((id, index) => ({
                        BuyerID: id,
                        Username: item.Usernames.split(',')[index]
                    }))
                }));

                res.json({ status: 200, data: formattedResult });
            }
        }
    );
});

app.get('/group/members', (req, res) => {
    const { groupId } = req.query;

    connection.query(`
        SELECT u.UserID, u.Username, u.Avatar
        FROM groupmember gm INNER JOIN user u ON gm.MemberID = u.UserID
        WHERE gm.GroupID = ?`, [groupId], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 500, message: "Server Error" });
        }
        else if (result.length === 0) {
            res.json({ status: 404, message: "Found 0 member!" })
        }
        else {
            res.json({ status: 200, message: "OK", data: result });
        }
    })
})

app.post('/group/members', (req, res) => {
    const { groupId, memberIds } = req.body;
    console.log(req.body);
    if (groupId === undefined || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ status: 400, message: "Invalid input" });
    }
    const values = memberIds.map(memberId => [groupId, memberId]);
    connection.beginTransaction((err) => {
        if (err) {
            console.error("Transaction Error:", err);
            return res.status(500).json({ status: 500, message: "Server error" });
        }
        connection.query(`SELECT UserID FROM user WHERE UserID IN (?)`, [memberIds], (selectErr, selectResult) => {
            if (selectErr) {
                console.error("Select Error:", selectErr);
                connection.rollback(() => {
                    res.status(500).json({ status: 500, message: "Server error" });
                });
                return;
            }
            const existingMemberIds = selectResult.map(user => user.UserID.toString());
            const missingMembers = memberIds.filter(id => !existingMemberIds.includes(id));
            if (missingMembers.length > 0) {
                console.log(missingMembers);
                connection.rollback(() => {
                    res.status(404).json({ status: 404, message: "Some users not found", missingMembers });
                });
                return;
            }
            connection.query(`INSERT INTO groupmember (GroupID, MemberID) VALUES ? ON DUPLICATE KEY UPDATE MemberID = MemberID`, [values], (insertErr) => {
                if (insertErr) {
                    console.error("Insert Error:", insertErr);
                    connection.rollback(() => {
                        res.status(500).json({ status: 500, message: "Server error" });
                    });
                    return;
                }
                connection.commit((commitErr) => {
                    if (commitErr) {
                        console.error("Commit Error:", commitErr);
                        connection.rollback(() => {
                            res.status(500).json({ status: 500, message: "Server error" });
                        });
                        return;
                    }
                    res.status(200).json({ status: 200, message: "Members added successfully" });
                });
            });
        });
    });
});

app.delete('/group/member', (req, res) => {
    const { groupId, memberId } = req.body;
    console.log(req.body);

    if (groupId === undefined || memberId === undefined) {
        return res.status(400).json({ status: 400, message: "Invalid input" });
    }

    connection.beginTransaction((transactionErr) => {
        if (transactionErr) {
            console.error("Transaction error:", transactionErr);
            return res.status(500).json({ status: 500, message: "Server error" });
        }
        connection.query(
            `DELETE FROM grouplist WHERE GroupID = ? AND BuyerID = ?`,
            [groupId, memberId],
            (glError) => {
                if (glError) {
                    console.error("Grouplist delete error:", glError);
                    return connection.rollback(() =>
                        res.status(500).json({ status: 500, message: "Server error" })
                    );
                }
                connection.query(
                    `DELETE FROM groupmember WHERE GroupID = ? AND MemberID = ?`,
                    [groupId, memberId],
                    (gmError) => {
                        if (gmError) {
                            console.error("Group member delete error:", gmError);
                            return connection.rollback(() =>
                                res.status(500).json({ status: 500, message: "Server error" })
                            );
                        }
                        connection.commit((commitErr) => {
                            if (commitErr) {
                                console.error("Commit error:", commitErr);
                                return connection.rollback(() =>
                                    res.status(500).json({ status: 500, message: "Server error" })
                                );
                            }
                            res.status(200).json({ status: 200, message: "OK" });
                        });
                    }
                );
            }
        );
    });
});

app.get('/statistic', (req, res) => {
    const { userId, startDate, endDate } = req.query;
    connection.query(`
        SELECT dl.DateToBuy, dl.Cost, li.ListID, li.ItemID, li.Amount, i.ItemName
        FROM dailylist dl INNER JOIN listitem li ON dl.ListID = li.ListID INNER JOIN item i ON li.ItemID = i.ItemID
        WHERE dl.UserID = ? AND dl.DateToBuy BETWEEN ? AND ?
        ORDER BY dl.DateToBuy
        `, [userId, startDate, endDate], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            res.json({ status: 200, data: result });
        }
    })
});




app.delete('/list-item', (req, res) => {
    const { dateToBuy, itemName } = req.body;

    if (!dateToBuy || !itemName) {
        return res.status(400).json({ status: 400, message: "dateToBuy and itemName are required" });
    }

    connection.query(
        'SELECT listitem.ListID, listitem.ItemID FROM listitem JOIN dailylist ON listitem.ListID = dailylist.ListID JOIN item ON listitem.ItemID = item.ItemID WHERE dailylist.DateToBuy = ? AND item.ItemName = ?',
        [dateToBuy, itemName],
        (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ status: 500, message: 'Error fetching data' });
            }

            if (results.length === 0) {
                return res.status(404).json({ status: 404, message: "No matching item found" });
            }

            const { ListID, ItemID } = results[0];

            connection.query(
                'DELETE FROM listitem WHERE ListID = ? AND ItemID = ?',
                [ListID, ItemID],
                (err, result) => {
                    if (err) {
                        console.error('Error deleting list item:', err);
                        return res.status(500).json({ status: 500, message: 'Error deleting list item' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ status: 404, message: "List item not found" });
                    }

                    connection.query(
                        'DELETE FROM grouplist WHERE ListID = ?',
                        [ListID],
                        (err, deleteGrouplistResult) => {
                            if (err) {
                                console.error('Error deleting from grouplist:', err);
                                return res.status(500).json({ status: 500, message: 'Error deleting from grouplist' });
                            }

                            connection.query(
                                'SELECT COUNT(*) AS count FROM listitem WHERE ListID = ?',
                                [ListID],
                                (err, countResult) => {
                                    if (err) {
                                        console.error('Error checking remaining list items:', err);
                                        return res.status(500).json({ status: 500, message: 'Error checking remaining list items' });
                                    }

                                    const count = countResult[0].count;

                                    if (count === 0) {
                                        connection.query(
                                            'DELETE FROM dailylist WHERE ListID = ?',
                                            [ListID],
                                            (err, deleteResult) => {
                                                if (err) {
                                                    console.error('Error deleting daily list:', err);
                                                    return res.status(500).json({ status: 500, message: 'Error deleting daily list' });
                                                }

                                                return res.status(200).json({
                                                    status: 200,
                                                    message: 'List item deleted, grouplist removed, and daily list removed successfully',
                                                });
                                            }
                                        );
                                    } else {
                                        return res.status(200).json({
                                            status: 200,
                                            message: 'List item deleted and grouplist removed successfully',
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});





app.post('/search/recipe', (req, res) => {
    const { name, ingredientIds, ownerIds } = req.body;
    console.log(req.body);
    console.log(name, ingredientIds, ownerIds)

    if (name) {
        const keywords = name.trim().split(/\s+/);
        const conditions = keywords.map(() => `RecipeName LIKE ?`).join(' AND ');
        const queryParams = keywords.map((word) => `%${word}%`);

        connection.query(
            `SELECT RecipeID, Username, RecipeImg, RecipeName
             FROM recipe r
             INNER JOIN user u ON r.UserID = u.UserID
             WHERE ${conditions}`,
            queryParams,
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err.message });
                } else {
                    res.json({ status: 200, data: formatRecipes(result) });
                }
            }
        );
    } else if (Array.isArray(ingredientIds) && ingredientIds.length > 0) {
        connection.query(
            `SELECT r.RecipeID, Username, RecipeImg, RecipeName, COUNT(ri.ItemID) AS MatchedIngredients
             FROM recipe r
             INNER JOIN user u ON r.UserID = u.UserID
             INNER JOIN recipeingredients ri ON ri.RecipeID = r.RecipeID
             WHERE ri.ItemID IN (?)
             GROUP BY r.RecipeID
             ORDER BY MatchedIngredients DESC`,
            [ingredientIds],
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err.message });
                } else {
                    res.json({ status: 200, data: formatRecipes(result) });
                }
            }
        );
    } else if (Array.isArray(ownerIds) && ownerIds.length > 0) {
        connection.query(
            `SELECT RecipeID, Username, RecipeImg, RecipeName
             FROM recipe r
             INNER JOIN user u ON r.UserID = u.UserID
             WHERE r.UserID IN (?)`,
            [ownerIds],
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.json({ status: 500, message: err.message });
                } else {
                    res.json({ status: 200, data: formatRecipes(result) });
                }
            }
        );
    } else {
        res.json({ status: 400, message: "Recipe name, ingredients, or owner ID required!" });
    }
});

app.post('/search/user', (req, res) => {
    const { name, ids } = req.body;
    if (name) {
        const keywords = name.trim().split(/\s+/);
        const conditions = keywords.map(() => `Username LIKE ?`).join(' AND ');
        const queryParams = keywords.map((word) => `%${word}%`);

        connection.query(
            `SELECT * FROM user WHERE ${conditions}`,
            queryParams,
            (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ message: err.message });
                } else {
                    console.log(result.map(i => formatUserInfo(i)));
                    res.status(200).json({ data: result.map(i => formatUserInfo(i)) });
                }
            })
    } else if (ids) {
        connection.query('SELECT * FROM user WHERE UserID IN (?)', [ids], (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ message: err.message });
            } else {
                console.log(result.map(i => formatUserInfo(i)));
                res.status(200).json({ data: result.map(i => formatUserInfo(i)) });
            }
        })
    }
    else {
        res.json({ Status: 400, message: "Name or ids not provided!" })
    }
})