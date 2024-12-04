const UserRepository = require('../repositories/user');

class UserService {
    constructor() {
        this.userRepository = new UserRepository();
    }

    async login(username, password) {
        const user = await this.userRepository.getByName(username);
        if (!user) {
            throw new Error('Username does not exist');
        }
        if (user.Password !== password) {
            throw new Error('Incorrect password');
        }
        return { userID: user.UserID };
    }

    async signup(username, password, email, phoneNumber) {
        const result = await this.userRepository.signup(username, password, email, phoneNumber);
        if (result.exists) {
            throw new Error('Username or email already exists');
        }
        return { userId: result.userId };
    }

    async getUserInfo(userId) {
        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async updateUserInfo(userId, username, email, phoneNumber, introduction) {
        const success = await this.userRepository.updateInfo(userId, username, email, phoneNumber, introduction);
        if (!success) {
            throw new Error('User not found');
        }
    }

    async updateUserAvatar(userId, avatarBuffer) {
        const success = await this.userRepository.updateAvatar(userId, avatarBuffer);
        if (!success) {
            throw new Error('User not found');
        }
    }
}

module.exports = UserService;
