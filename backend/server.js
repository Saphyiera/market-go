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
    password: 'ROOT',
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
                        res.status(200).send('Items added successfully');
                    }
                );
            }
        );
    });
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

app.post('/recipe', upload.single('recipeImg'), (req, res) => {
    const { userId, recipeName, instructions } = req.body;
    const recipeImg = req.file ? req.file.buffer : null;

    connection.query('SELECT MAX(RecipeID) AS maxId FROM recipe', (err, result) => {
        if (err) {
            console.error('Error retrieving max RecipeID:', err);
            return res.status(500).send('Error retrieving recipe ID');
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
                return res.status(500).send('Error adding recipe');
            }
            res.status(200).send('Recipe added successfully');
        });
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
                res.status(500).json({ status: 500, message: "Server Error" });
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
            GROUP_CONCAT(u.Username) AS Usernames
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

            if (memberIds.length === usernames.length) {
                for (let i = 0; i < memberIds.length; i++) {
                    groupDetails.Members.push({
                        MemberID: memberIds[i],
                        Username: usernames[i],
                    });
                }
            }
            console.log(groupDetails)
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