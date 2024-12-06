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

function formatRecipes(data) {
    return data.map(item => ({
        ...item,
        RecipeImg: item.RecipeImg ? item.RecipeImg.toString('base64') : null,
    }))
}

function formatUserInfo(data) {
    return {
        ...data,
        Avatar: data.Avatar ? data.Avatar.toString('base64') : null,
    }
}