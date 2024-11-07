const mysql = require('mysql2');
const fetch = require('node-fetch'); // Use fetch for node.js
const { Buffer } = require('buffer');

// Create a connection to your database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ROOT',
    database: 'market'
});

// Function to update avatar
async function updateAvatar(userId) {
    try {
        // Fetch image from the URL using fetch
        const imageUrl = 'https://i.pinimg.com/736x/e5/2d/3d/e52d3d27c318b027edccb37f0541d9d7.jpg';
        const response = await fetch(imageUrl);

        if (!response.ok) {
            throw new Error('Failed to fetch the image');
        }

        // Get the image data as an ArrayBuffer, then convert it to a Buffer
        const imageArrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(imageArrayBuffer);

        // Query to update the Avatar for the given UserID
        const query = 'UPDATE user SET Avatar = ? WHERE UserID = ?';
        connection.execute(query, [imageBuffer, userId], (err, results) => {
            if (err) {
                console.error('Error updating avatar:', err);
            } else {
                console.log(`Avatar updated successfully for UserID ${userId}`);
            }
        });
    } catch (error) {
        console.error('Error fetching image:', error);
    }
}

// Call the function to update avatar for UserID 2
updateAvatar(1);
