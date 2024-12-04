const express = require('express');
const router = express.Router();
const NotificationController = require('../controller/notification')

const notificationController = new NotificationController();

router.get('/', notificationController.getNotifications);
router.post('/', notificationController.setNotification);
router.delete('/', notificationController.disableNotification);

module.exports = router;