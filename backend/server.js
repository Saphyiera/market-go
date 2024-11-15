const express = require('express')
const mysql = require('mysql2')
const multer = require('multer')
const { formatPlans, formatFridgeItems, formatRecipes, formatRecipe, formatItem, isValidEmail, isValidPhoneNumber } = require('./middleware/middleware')
const cors = require('cors')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'market'
})

connection.connect((err) => {
    if (err) {
        console.log("Can't connect to database!");
    }
    console.log("Connected to market database!");
})

const app = express()
app.use(express.json())
app.use(cors())

app.listen(port = 2811, () => {
    console.log(`Server is listening on http:/localhost:${port}`)
})


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const checkUsernameQuery = 'SELECT Password, UserID FROM user WHERE Username = ?';

    connection.query(checkUsernameQuery, [username], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Username does not exist' });
        }

        const storedPassword = results[0].Password;
        const userID = results[0].UserID;

        if (storedPassword === password) {
            res.status(200).json({ userID });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    });
});

app.post('/signup', (req, res) => {
    const { username, password, email, phoneNumber } = req.body;

    if (!username || !password || !email || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const queryCheck = 'SELECT * FROM user WHERE Username = ? OR Email = ?';
    connection.query(queryCheck, [username, email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const queryMaxId = 'SELECT MAX(userId) AS maxUserId FROM user';
        connection.query(queryMaxId, (err, results) => {
            if (err) {
                console.error('Error getting max userId:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const newUserId = results[0].maxUserId != null ? results[0].maxUserId + 1 : 0;

            const queryInsert = 'INSERT INTO user (UserId, Username, Password, Email, PhoneNumber) VALUES (?, ?, ?, ?, ?)';
            connection.query(queryInsert, [newUserId, username, password, email, phoneNumber], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({ message: 'User registered successfully', userId: newUserId });
            });
        });
    });
});

app.get('/user', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = 'SELECT * FROM user WHERE UserId = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.json({ status: 500, error: 'Database error' });
        }

        if (results.length > 0) {
            res.json({ status: 200, data: results[0] });
        } else {
            res.json({ status: 404, error: 'User not found' });
        }
    });
});

//Update info
app.post('/user/info', (req, res) => {
    const { userId, username, email, phoneNumber, introduction } = req.body;

    if (!userId || !username || !email || !phoneNumber) {
        return res.status(400).json({ error: 'userId, username, email, and phoneNumber are required' });
    }

    const queryUpdate = `
        UPDATE user 
        SET Username = ?, 
            Email = ?, 
            PhoneNumber = ?, 
            Introduction = COALESCE(?, Introduction)
        WHERE UserID = ?
    `;

    connection.query(
        queryUpdate,
        [username, email, phoneNumber, introduction, userId],
        (err, result) => {
            if (err) {
                console.error('Error updating user info:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User info updated successfully' });
        }
    );
});

//Update avatar
app.post('/user/avatar', upload.single('avatar'), (req, res) => {
    const userId = req.body.userId;

    if (!userId || !req.file) {
        console.log(userId, "+", req.file);
        return res.status(400).json({ error: 'userId and avatar image are required' });
    }

    const avatarBuffer = req.file.buffer;

    const queryUpdate = `
        UPDATE user 
        SET Avatar = ?
        WHERE UserID = ?
    `;

    connection.query(
        queryUpdate,
        [avatarBuffer, userId],
        (err, result) => {
            if (err) {
                console.error('Error updating avatar:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'Avatar updated successfully' });
        }
    );
});

// Example API to get all users and their avatars
app.get('/users/avt', (req, res) => {
    const query = 'SELECT UserID, Username, Avatar FROM user';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ status: 200, users: results });
    });
});

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


app.delete('/recipe/ingredient', (req, res) => {
    const { recipeId, itemId } = req.body;

    connection.query(`
        DELETE FROM recipeingredient WHERE RecipeID = ? AND ItemID = ?
        `, [recipeId, itemId], (err) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error!" });
        } else {
            res.json({ status: 200, message: "OK" });
        }
    })
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

    connection.query(`DELETE FROM recipe WHERE RecipeID = ?`, [recipeId], (err, result) => {
        if (err) {
            console.log(err);
            res.json({ status: 500, message: err });
        } else {
            res.json({ status: 200 });
        }
    })
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
    const values = recipeId.map((i) => [userId, dateToDo, i]);
    connection.query(`INSERT INTO dishplan(UserID, RecipeID, DateToDo) VALUES ?`, values, (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server error" });
        } else {
            res.json({ status: 200, message: result });
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

    connection.query('DELETE FROM dishplan WHERE UserID = ? AND DateToDo = ? AND RecipeID IN (?)', [userId, dateToDo, recipeId], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            res.json({ status: 200, message: result });
        }
    })
})

app.post('/group-list/buyer', (req, res) => {
    const { groupId, listId, buyerId } = req.body;
    const values = buyerId.map((i) => {
        groupId, listId, i
    })

    connection.query('INSERT INTO grouplist(GroupID, ListID, BuyerID) VALUES ? ON DUPLICATE KEY UPDATE BuyerID = BuyerID',
        values, (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: "Server Error" });
            } else {
                res.json({ status: 200, message: result });
            }
        })
})

app.delete('/group-list/buyer', (req, res) => {
    const { groupId, listId, buyerId } = req.body;

    connection.query(`DELETE FROM grouplist WHERE GroupID = ? AND ListID = ? AND BuyerID IN (?)`, [groupId, listId, buyerId], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server Error" });
        } else {
            res.json({ status: 200, message: result });
        }
    })
})

app.get('/group/user', (req, res) => {
    const userId = req.query.userId;
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




