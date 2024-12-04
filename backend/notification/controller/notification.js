const NotificationService = require("../service/notification");

class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
        this.getNotifications = this.getNotifications.bind(this);
        this.setNotification = this.setNotification.bind(this);
        this.disableNotification = this.disableNotification.bind(this);
    }


    async getNotifications(req, res) {
        try {
            const notifications = await this.notificationService.getNotifications();
            res.json({ status: 200, data: notifications });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        }
    };

    async setNotification(req, res) {
        const { deviceId, userId } = req.body;
        if (!deviceId || !userId) {
            return res.status(400).json({ status: 400, message: "Missing required fields" });
        }

        try {
            await this.notificationService.setNotification(deviceId, userId);
            res.status(201).json({ status: 201, message: "Notification set successfully" });
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        }
    }

    async disableNotification(req, res) {
        const { deviceId, userId } = req.body;
        if (!deviceId || !userId) {
            return res.status(400).json({ status: 400, message: "Missing required fields" });
        }

        try {
            await this.notificationService.disableNotification(deviceId, userId);
            res.status(204).send();
        } catch (err) {
            console.error(err);
            res.status(500).json({ status: 500, message: "Server error" });
        }
    }
}
module.exports = NotificationController