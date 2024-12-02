const axios = require("axios");
const cron = require('node-cron');

const sendNotification = async () => {
    try {
        const response = await axios.get('http://localhost:2812/');
        const result = response.data;

        if (response.status === 200) {
            result.data.forEach((device) => {
                let msg = device.Notifications.reduce((prev, curr) => {
                    return `${prev}- ${curr.Amount} of ${curr.ItemName} will expire on ${new Date(curr.ExpireDate).toLocaleDateString()}\n`;
                }, "You have:\n");
                msg += "Enjoy your foods before it's too late!";

                axios.post('https://app.nativenotify.com/api/indie/notification', {
                    subID: device.DeviceID,
                    appId: 25041,
                    appToken: 'mF80USeXXVwmFYiJzGyVco',
                    title: `${device.Username}'s Fridge Notification`,
                    message: msg,
                })
                    .then(() => console.log(`Notification sent to ${device.Username}`))
                    .catch((error) => console.error(`Failed to send notification to ${device.Username}:`, error.message));
            });
        } else {
            console.error(`Failed to fetch data: ${response.status}`);
        }
    } catch (error) {
        console.error("Error in sendNotification:", error.message);
    }
};

// Schedule the task to run at 8 AM every day
cron.schedule("0 8 * * *", () => {
    console.log("Sending notifications at 8 AM");
    sendNotification();
});