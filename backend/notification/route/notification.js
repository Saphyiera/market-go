const express = require('express');
const NotificationService = require('../service/notification');
const router = express.Router();

const notificationService = new NotificationService();

router.get('/', async (req, res) => {
    try {
        const notifications = await notificationService.getNotifications();
        res.json({ status: 200, data: notifications });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Server error" });
    }
});

router.post('/', async (req, res) => {
    const { deviceId, userId } = req.body;
    if (!deviceId || !userId) {
        return res.status(400).json({ status: 400, message: "Missing required fields" });
    }

    try {
        await notificationService.setNotification(deviceId, userId);
        res.status(201).json({ status: 201, message: "Notification set successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Server error" });
    }
});

router.delete('/', async (req, res) => {
    const { deviceId, userId } = req.body;
    if (!deviceId || !userId) {
        return res.status(400).json({ status: 400, message: "Missing required fields" });
    }

    try {
        await notificationService.disableNotification(deviceId, userId);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 500, message: "Server error" });
    }
});

module.exports = router;