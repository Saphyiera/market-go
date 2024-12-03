class User {
    /**
     * @param {number} userId - Unique identifier for the user.
     * @param {string} username - Name of the user.
     * @param {string} password - Encrypted password for the user.
     * @param {string} email - Email address of the user.
     * @param {string} phoneNumber - Phone number of the user.
     * @param {string} introduction - Short bio or description of the user.
     * @param {Buffer|null} avatar - Binary data for the user's avatar (image).
     */
    constructor(userId, username, password, email, phoneNumber, introduction, avatar = null) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.introduction = introduction;
        this.avatar = avatar;
    }
}

module.exports = User;
