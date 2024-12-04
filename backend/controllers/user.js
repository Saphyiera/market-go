const UserService = require('../services/user');

class UserController {
    constructor() {
        this.userService = new UserService();
        this.isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
        this.isValidPhoneNumber = (phone) => /^\d{10,15}$/.test(phone);
    }

    async login(req, res) {
        try {
            const { username, password } = req.body;
            if (!username || !password) {
                return res.status(400).json({ message: 'Username and password are required' });
            }
            const result = await this.userService.login(username, password);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async signup(req, res) {
        try {
            const { username, password, email, phoneNumber } = req.body;
            if (!username || !password || !email || !phoneNumber) {
                return res.status(400).json({ error: 'All fields are required' });
            }
            if (!this.isValidEmail(email)) {
                return res.status(400).json({ error: 'Invalid email format' });
            }
            if (!this.isValidPhoneNumber(phoneNumber)) {
                return res.status(400).json({ error: 'Invalid phone number format' });
            }
            const result = await this.userService.signup(username, password, email, phoneNumber);
            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getUserInfo(req, res) {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({ error: 'User ID is required' });
            }
            const user = await this.userService.getUserInfo(userId);
            res.status(200).json({ data: user });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateUserInfo(req, res) {
        try {
            const { userId, username, email, phoneNumber, introduction } = req.body;
            if (!userId || !username || !email || !phoneNumber) {
                return res.status(400).json({ error: 'userId, username, email, and phoneNumber are required' });
            }
            await this.userService.updateUserInfo(userId, username, email, phoneNumber, introduction);
            res.status(200).json({ message: 'User info updated successfully' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async updateAvatar(req, res) {
        try {
            const userId = req.body.userId;
            const avatarBuffer = req.file?.buffer;
            if (!userId || !avatarBuffer) {
                return res.status(400).json({ error: 'userId and avatar image are required' });
            }
            await this.userService.updateUserAvatar(userId, avatarBuffer);
            res.status(200).json({ message: 'Avatar updated successfully' });
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }
}

module.exports = UserController;