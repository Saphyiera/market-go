class INotification {
    getNotifications() {
        throw new Error("Method 'getNotifications' must be implemented!");
    }
    setNotification(deviceId, userId) {
        throw new Error("Method 'setNotification' must be implemented!");
    }
    disableNotification(deviceId, userId) {
        throw new Error("Method 'disableNotification' must be implemented!");
    }
}

module.exports = INotification;
