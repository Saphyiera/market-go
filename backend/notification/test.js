fetch('http://localhost:2812', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
})
    .then(response => response.json())
    .then(data => {
        console.log('Notifications:', data);
    })
    .catch(error => {
        console.error('Error fetching notifications:', error);
    });

// const notificationData = {
//     deviceId: '12345',
//     userId: 1
// };

// fetch('http://localhost:2812', {
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(notificationData),
// })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Notification created:', data);
//     })
//     .catch(error => {
//         console.error('Error creating notification:', error);
//     });

const deleteData = {
    deviceId: '12345',
    userId: 1
};

// fetch('http://localhost:2812', {
//     method: 'DELETE',
//     headers: {
//         'Content-Type': 'application/json',
//     },
//     body: JSON.stringify(deleteData),
// })
//     .then(response => {
//         if (response.status === 204) {
//             console.log('Notification deleted successfully');
//         } else {
//             response.json().then(data => console.error(data));
//         }
//     })
//     .catch(error => {
//         console.error('Error deleting notification:', error);
//     });