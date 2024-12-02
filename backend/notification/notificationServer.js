const express = require('express');
const cors = require('cors');
const connection = require('../db/connection');

const app = express();
const port = 2812;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    connection.query(`
        SELECT 
            n.DeviceID,
            u.Username, 
            f.ExpireDate, 
            f.Amount, 
            i.ItemName
        FROM 
            notification n 
        INNER JOIN 
            fridge f ON n.UserID = f.UserID 
        INNER JOIN 
            \`user\` u ON n.UserID = u.UserID
        INNER JOIN 
            item i ON i.ItemID = f.ItemID
        WHERE 
            f.ExpireDate BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
    `, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        } else {
            const mergedData = result.reduce((acc, curr) => {
                const { DeviceID, Username, ExpireDate, Amount, ItemName } = curr;
                if (!acc[DeviceID]) {
                    acc[DeviceID] = {
                        DeviceID,
                        Username,
                        Notifications: []
                    };
                }
                acc[DeviceID].Notifications.push({
                    ExpireDate: ExpireDate.toISOString().split("T")[0],
                    Amount,
                    ItemName
                });
                return acc;
            }, {});
            const finalData = Object.values(mergedData);
            res.json({ status: 200, data: finalData });
        }
    });
});

app.post('/', (req, res) => {
    const { deviceId, userId } = req.body;
    if (!deviceId || !userId) {
        return res.status(400).json({ status: 400, message: "Missing required fields" });
    }
    connection.query('INSERT INTO notification(DeviceID, UserID) VALUES (?, ?) ON DUPLICATE KEY UPDATE UserID = UserID', [deviceId, userId], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        } else {
            res.status(201).json({ status: 201, message: "Notification set successfully" });
        }
    });
});

app.delete('/', (req, res) => {
    const { deviceId, userId } = req.body;
    if (!deviceId || !userId) {
        return res.status(400).json({ status: 400, message: "Missing required fields" });
    }
    connection.query('DELETE FROM notification WHERE DeviceID = ? AND UserID = ?', [deviceId, userId], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        } else {
            res.status(204).send();
        }
    });
});