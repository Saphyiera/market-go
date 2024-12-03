const connection = require('../../db/connection')
const INotification = require('../interface/notification')

class NotificationRepository extends INotification {
    async getNotifications() {
        return new Promise((resolve, reject) => {
            const query = `
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
            `;
            connection.query(query, (err, result) => {
                if (err) {
                    reject(err);
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
                    resolve(Object.values(mergedData));
                }
            });
        });
    }
    async setNotification(deviceId, userId) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO notification(DeviceID, UserID) VALUES (?, ?) ON DUPLICATE KEY UPDATE UserID = UserID';
            connection.query(query, [deviceId, userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    async disableNotification(deviceId, userId) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM notification WHERE DeviceID = ? AND UserID = ?';
            connection.query(query, [deviceId, userId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = NotificationRepository;