const express = require('express')
const multer = require('multer')
const { formatPlans, formatFridgeItems, formatRecipes, formatRecipe, formatItem, isValidEmail, isValidPhoneNumber, formatUserInfo } = require('./middleware/middleware')
const cors = require('cors')
const connection = require('./db/connection')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const app = express()
app.use(express.json())
app.use(cors())

app.listen(port = 2811, () => {
    console.log(`Server is listening on http:/localhost:${port}`)
})

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const isValidPhoneNumber = (phone) => /^\d{10,15}$/.test(phone);

app.post('/user/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const checkUsernameQuery = 'SELECT Password, UserID FROM user WHERE Username = ?';

    connection.query(checkUsernameQuery, [username], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Username does not exist' });
        }

        const storedPassword = results[0].Password;
        const userID = results[0].UserID;

        if (storedPassword === password) {
            res.status(200).json({ userID });
        } else {
            res.status(401).json({ message: 'Incorrect password' });
        }
    });
});

app.post('/user/signup', (req, res) => {
    const { username, password, email, phoneNumber } = req.body;

    if (!username || !password || !email || !phoneNumber) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!isValidPhoneNumber(phoneNumber)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }

    const queryCheck = 'SELECT * FROM user WHERE Username = ? OR Email = ?';
    connection.query(queryCheck, [username, email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        const queryMaxId = 'SELECT MAX(userId) AS maxUserId FROM user';
        connection.query(queryMaxId, (err, results) => {
            if (err) {
                console.error('Error getting max userId:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            const newUserId = results[0].maxUserId != null ? results[0].maxUserId + 1 : 0;

            const queryInsert = 'INSERT INTO user (UserId, Username, Password, Email, PhoneNumber) VALUES (?, ?, ?, ?, ?)';
            connection.query(queryInsert, [newUserId, username, password, email, phoneNumber], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                res.status(201).json({ message: 'User registered successfully', userId: newUserId });
            });
        });
    });
});

app.get('/user', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    const query = 'SELECT * FROM user WHERE UserId = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.json({ status: 500, error: 'Database error' });
        }

        if (results.length > 0) {
            res.json({ status: 200, data: results[0] });
        } else {
            res.json({ status: 404, error: 'User not found' });
        }
    });
});

//Update info
app.post('/user/info', (req, res) => {
    const { userId, username, email, phoneNumber, introduction } = req.body;

    if (!userId || !username || !email || !phoneNumber) {
        return res.status(400).json({ error: 'userId, username, email, and phoneNumber are required' });
    }

    const queryUpdate = `
        UPDATE user 
        SET Username = ?, 
            Email = ?, 
            PhoneNumber = ?, 
            Introduction = COALESCE(?, Introduction)
        WHERE UserID = ?
    `;

    connection.query(
        queryUpdate,
        [username, email, phoneNumber, introduction, userId],
        (err, result) => {
            if (err) {
                console.error('Error updating user info:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'User info updated successfully' });
        }
    );
});

//Update avatar
app.post('/user/avatar', upload.single('avatar'), (req, res) => {
    const userId = req.body.userId;

    if (!userId || !req.file) {
        console.log(userId, "+", req.file);
        return res.status(400).json({ error: 'userId and avatar image are required' });
    }

    const avatarBuffer = req.file.buffer;

    const queryUpdate = `
        UPDATE user 
        SET Avatar = ?
        WHERE UserID = ?
    `;

    connection.query(
        queryUpdate,
        [avatarBuffer, userId],
        (err, result) => {
            if (err) {
                console.error('Error updating avatar:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.status(200).json({ message: 'Avatar updated successfully' });
        }
    );
});