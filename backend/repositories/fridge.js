const connection = require('../db/connection');
const IFridge = require('../interfaces/fridge');

class FridgeRepository extends IFridge {
    getFridgeItems(userId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT fridge.ItemID, ExpireDate, Amount, ItemName, ItemDescription, ItemImg
                FROM fridge
                INNER JOIN item ON fridge.ItemID = item.ItemID
                WHERE UserID = ?
            `;
            connection.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });
    }

    deleteAllItems(userId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM fridge WHERE UserID = ?`;
            connection.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }

    deleteItem(userId, itemId) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM fridge WHERE UserID = ? AND ItemID = ?`;
            connection.query(query, [userId, itemId], (err, results) => {
                if (err) return reject(err);
                resolve(true);
            });
        });
    }

    addItem(userId, itemId, expireDate, amount) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO fridge (ItemID, UserID, ExpireDate, Amount)
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    Amount = VALUES(Amount)
            `;
            connection.query(query, [itemId, userId, expireDate, amount], (err, results) => {
                if (err) return reject(err);
                resolve(results.affectedRows > 0);
            });
        });
    }
}

module.exports = FridgeRepository;