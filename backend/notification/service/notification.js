const NotificationRepository = require('../repository/notification');

class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    async getNotifications() {
        try {
            return await this.notificationRepository.getNotifications();
        } catch (err) {
            throw new Error('Error fetching notifications: ' + err.message);
        }
    }

    async setNotification(deviceId, userId) {
        try {
            await this.notificationRepository.setNotification(deviceId, userId);
        } catch (err) {
            throw new Error('Error adding notification: ' + err.message);
        }
    }

    async disableNotification(deviceId, userId) {
        try {
            await this.notificationRepository.disableNotification(deviceId, userId);
        } catch (err) {
            throw new Error('Error deleting notification: ' + err.message);
        }
    }
}

module.exports = NotificationService;
