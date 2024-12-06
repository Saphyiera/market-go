const express = require('express')

const connection = require('../db/connection')
const router = express.Router();

router.get('/', (req, res) => {
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

router.post('/share', (req, res) => {
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

router.post('/buyers', (req, res) => {
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

module.exports = router;