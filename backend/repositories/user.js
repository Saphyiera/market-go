const IUser = require('../interfaces/user')
const connection = require('../db/connection')

class UserRepository extends IUser {

    async getByName(username) {
        const query = 'SELECT Password, UserID FROM user WHERE Username = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [username], (err, results) => {
                if (err) return reject(err);
                if (results.length === 0) return resolve(null);
                resolve(results[0]);
            });
        });
    }

    async signup(username, password, email, phoneNumber) {
        return new Promise((resolve, reject) => {
            const queryCheck = 'SELECT * FROM user WHERE Username = ? OR Email = ?';
            connection.query(queryCheck, [username, email], (err, results) => {
                if (err) return reject(err);
                if (results.length > 0) return resolve({ exists: true });

                const queryMaxId = 'SELECT MAX(userId) AS maxUserId FROM user';
                connection.query(queryMaxId, (err, results) => {
                    if (err) return reject(err);

                    const newUserId = results[0].maxUserId != null ? results[0].maxUserId + 1 : 0;
                    const queryInsert = `
                        INSERT INTO user (UserId, Username, Password, Email, PhoneNumber)
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    connection.query(queryInsert, [newUserId, username, password, email, phoneNumber], (err) => {
                        if (err) return reject(err);
                        resolve({ success: true, userId: newUserId });
                    });
                });
            });
        });
    }

    async getById(userId) {
        const query = 'SELECT * FROM user WHERE UserId = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results.length > 0 ? results[0] : null);
            });
        });
    }

    async updateInfo(userId, username, email, phoneNumber, introduction) {
        const query = `
            UPDATE user
            SET Username = ?, Email = ?, PhoneNumber = ?, Introduction = COALESCE(?, Introduction)
            WHERE UserID = ?
        `;
        return new Promise((resolve, reject) => {
            connection.query(query, [username, email, phoneNumber, introduction, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows > 0);
            });
        });
    }

    async updateAvatar(userId, avatarBuffer) {
        const query = `
            UPDATE user
            SET Avatar = ?
            WHERE UserID = ?
        `;
        return new Promise((resolve, reject) => {
            connection.query(query, [avatarBuffer, userId], (err, result) => {
                if (err) return reject(err);
                resolve(result.affectedRows > 0);
            });
        });
    }
}

module.exports = UserRepository;