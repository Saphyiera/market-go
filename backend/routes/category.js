const express = require('express');
const { uploadBase64Image } = require('../imageUploadConfig');
const connection = require('../db/connection');
const router = express.Router();

router.get('/', (req, res) => {
    const query = `SELECT * FROM category`;
    connection.query(query, (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: "Server error" });
        } else {
            res.json({ status: 200, data: result });
        }
    })
})

router.get('/items', (req, res) => {
    const categoryId = parseInt(req.query.categoryId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    connection.query(
        `SELECT ItemID, ItemName, ItemDescription, ItemImg 
        FROM item 
        WHERE ItemID IN (SELECT ItemID FROM categoryitem WHERE CategoryID = ?) 
        LIMIT ? OFFSET ?`,
        [categoryId, limit, offset],
        (err, results) => {
            if (err) {
                return res.status(500).send('Error retrieving items');
            }

            const itemsWithImages = results.map(item => ({
                ...item,
                ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
            }));

            connection.query(
                'SELECT COUNT(*) AS total FROM item WHERE ItemID IN (SELECT ItemID FROM categoryitem WHERE CategoryID = ?)',
                [categoryId],
                (err, countResult) => {
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
                }
            );
        }
    );
});

module.exports = router;