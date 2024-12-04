const IItem = require('../interfaces/item');
const connection = require('../db/connection');

class ItemRepository extends IItem {
    async getById(itemId) {
        const query = 'SELECT * FROM item WHERE ItemID = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [itemId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    async getByName(itemName) {
        const nameParts = itemName.toLowerCase().split(' ');
        const likeConditions = nameParts.map(() => `LOWER(ItemName) LIKE ?`).join(' OR ');
        const query = `SELECT * FROM item WHERE ${likeConditions}`;
        const params = nameParts.map(part => `%${part}%`);

        return new Promise((resolve, reject) => {
            connection.query(query, params, (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    async getAll(page, limit) {
        const offset = (page - 1) * limit;
        const query = 'SELECT * FROM item LIMIT ? OFFSET ?';

        return new Promise((resolve, reject) => {
            connection.query(query, [limit, offset], (err, results) => {
                if (err) return reject(err);
                const itemsWithImages = results.map(item => ({
                    ...item,
                    ItemImg: item.ItemImg ? item.ItemImg.toString('base64') : null,
                }));
                const countQuery = 'SELECT COUNT(*) AS total FROM item';
                connection.query(countQuery, (err, countResult) => {
                    if (err) return reject(err);

                    const totalItems = countResult[0].total;
                    const totalPages = Math.ceil(totalItems / limit);
                    resolve({
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
    }

    async addItem(itemName, itemDescription, itemImage) {
        const getMaxIdQuery = 'SELECT MAX(ItemID) AS maxId FROM item';

        return new Promise((resolve, reject) => {
            connection.query(getMaxIdQuery, (err, result) => {
                if (err) return reject(err);

                const maxId = result[0].maxId;
                const newItemId = maxId !== null ? maxId + 1 : 0;

                const insertQuery = `
                    INSERT INTO item (ItemID, ItemName, ItemDescription, ItemImg)
                    VALUES (?, ?, ?, ?)
                `;

                connection.query(insertQuery, [newItemId, itemName, itemDescription, itemImage], (err) => {
                    if (err) return reject(err);
                    resolve({ success: true, itemId: newItemId });
                });
            });
        });
    }
}

module.exports = ItemRepository;
