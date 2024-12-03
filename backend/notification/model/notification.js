class Notification {
    /**
     * @param {string} deviceID - Unique identifier for the device.
     * @param {number} userID - Unique identifier for the user.
     */
    constructor(deviceID, userID) {
        this.deviceID = deviceID;
        this.userID = userID;
    }
}

module.exports = Notification;
