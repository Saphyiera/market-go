class IUser {
    getByName(username) {
        throw new Error("Method 'login' must be implemented!");
    }
    signup(username, password, email, phoneNumber) {
        throw new Error("Method 'signup' must be implemented!");
    }
    getById(userId) {
        throw new Error("Method 'getById' must be implemented!");
    }
    updateInfo(userId, username, email, phoneNumber, introduction) {
        throw new Error("Method 'updateInfo' must be implemented!");
    }
    updateAvatar(userId, avatarBuffer) {
        throw new Error("Method 'updateAvatar' must be implemented!");
    }
}

module.exports = IUser;