const { PASSWORD } = require('../constant')
const mysql = require('mysql2')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: PASSWORD,
    database: 'market'
})

connection.connect((err) => {
    if (err) {
        console.log("Can't connect to database!");
    }
    console.log("Connected to market database!");
})

module.exports = connection;