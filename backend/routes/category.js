const express = require('express');
const multer = require('multer');
const { uploadBase64Image } = require('../imageUploadConfig');
const connection = require('../db/connection');
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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

router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file || !req.body.Name || !req.body.Description) {
            return res.status(400).json({ error: 'All fields (Name, image, Description) are required' });
        }
        console.log(req.file)

        const url = await uploadBase64Image(req.file.buffer.toString('base64'));

        connection.query(
            `INSERT INTO category (Name, Image, Description) VALUES (?, ?, ?)`,
            [req.body.Name, url, req.body.Description],
            (err, result) => {
                if (err) {
                    console.error('Error inserting data into database:', err);
                    return res.status(500).json({ error: 'Failed to insert category' });
                }

                res.status(201).json({
                    message: 'Category added successfully',
                    category: result[0],
                });
            }
        );
    } catch (error) {
        console.error('Error during category creation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.put('/:categoryId', upload.single('image'), async (req, res) => {
    const { categoryId } = req.params;
    const { Name, Description } = req.body;

    try {
        if (!Name || !Description) {
            return res.status(400).json({ error: 'Name and Description are required' });
        }

        let imageUrl;
        if (req.file) {
            imageUrl = await uploadBase64Image(req.file.buffer.toString('base64'));
        }

        let query = `UPDATE category SET Name = ?, Description = ?`;
        const values = [Name, Description];

        if (imageUrl) {
            query += `, Image = ?`;
            values.push(imageUrl);
        }

        query += ` WHERE id = ?`;
        values.push(categoryId);

        connection.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating data in database:', err);
                return res.status(500).json({ error: 'Failed to update category' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Category not found' });
            }

            res.status(200).json({ message: 'Category updated successfully' });
        });
    } catch (error) {
        console.error('Error during category update:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/:categoryId', (req, res) => {
    const { categoryId } = req.params;
    connection.beginTransaction((err) => {
        if (err) {
            console.error('Transaction error:', err);
            return res.status(500).json({ message: "Failed to start transaction", status: 500 });
        }

        connection.query(
            `DELETE FROM categoryitem WHERE CategoryID = ?`,
            [categoryId],
            (err, result) => {
                if (err) {
                    console.error('Error deleting from categoryitem:', err);
                    return connection.rollback(() => {
                        res.status(500).json({ message: "Failed to delete from categoryitem", status: 500 });
                    });
                }

                connection.query(
                    `DELETE FROM category WHERE ID = ?`,
                    [categoryId],
                    (errr, resultt) => {
                        if (errr) {
                            console.error('Error deleting from category:', errr);
                            return connection.rollback(() => {
                                res.status(500).json({ message: "Failed to delete category", status: 500 });
                            });
                        }

                        connection.commit((commitErr) => {
                            if (commitErr) {
                                console.error('Transaction commit error:', commitErr);
                                return connection.rollback(() => {
                                    res.status(500).json({ message: "Failed to commit transaction", status: 500 });
                                });
                            }

                            res.status(200).json({ message: "Category deleted successfully" });
                        });
                    }
                );
            }
        );
    });
});

module.exports = router;