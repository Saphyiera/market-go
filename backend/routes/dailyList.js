const express = require('express')
const connection = require('../db/connection')
const router = express.Router();

function formatPlans(rawData) {
    return rawData.reduce((acc, item) => {
        const formattedDate = formatDate(item.DateToBuy);

        let dateEntry = acc.find(plan => plan.dateToBuy === formattedDate);
        if (!dateEntry) {
            dateEntry = { dateToBuy: formattedDate, listItem: [] };
            acc.push(dateEntry);
        }

        dateEntry.listItem.push({
            itemName: item.ItemName,
            amount: item.Amount
        });

        return acc;
    }, []);
}

router.get('/month', (req, res) => {
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

router.get('/next-30-days', (req, res) => {
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

router.get('/all', (req, res) => {
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

router.get('/', (req, res) => {
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

router.post('/', (req, res) => {
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


router.put('/', (req, res) => { // Update plan
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

module.exports = router;