const fs = require('fs');
const axios = require('axios');
const mysql = require('mysql2');

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost', // change to your MySQL host
    user: 'root', // change to your MySQL username
    password: 'ROOT', // change to your MySQL password
    database: 'market', // change to your database name
});

// URL of the image
const imageUrl = 'https://i.pinimg.com/736x/06/38/e1/0638e1833558ebce0c925bf67c5d7883.jpg';

// Download the image and convert to Base64
axios.get(imageUrl, { responseType: 'arraybuffer' })
    .then(response => {
        const imageBuffer = Buffer.from(response.data, 'binary'); // Convert the binary response to a Buffer
        const base64Image = imageBuffer.toString('base64'); // Convert the Buffer to Base64

        // Update the user table with the avatar
        const query = 'UPDATE user SET avatar = ? WHERE userid = 1';
        connection.query(query, [base64Image], (err, result) => {
            if (err) {
                console.error('Error updating avatar:', err);
            } else {
                console.log('Avatar updated successfully!');
            }
            connection.end(); // Close the database connection
        });
    })
    .catch(err => {
        console.error('Error downloading image:', err);
    });
