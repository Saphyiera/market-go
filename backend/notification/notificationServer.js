const express = require('express');
const cors = require('cors');
const notificationRoutes = require('./route/notification')

const app = express();
const port = 2812;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});

app.use('/', notificationRoutes)