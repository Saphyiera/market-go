const express = require('express');
const nodemailer = require('nodemailer')
const connection = require('../db/connection')
const router = express.Router();

router.get('/user/all', (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
    const pageSize = parseInt(req.query.pageSize) || 10; // Default to 10 items per page

    const offset = (page - 1) * pageSize;

    connection.query(`SELECT * FROM \`user\` LIMIT ? OFFSET ?`, [pageSize, offset], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message });
        } else {
            connection.query(`SELECT COUNT(*) AS total FROM \`user\``, (countErr, countResult) => {
                if (countErr) {
                    console.error(countErr);
                    res.json({ status: 500, message: countErr.message });
                } else {
                    const totalItems = countResult[0].total;
                    const totalPages = Math.ceil(totalItems / pageSize);

                    res.json({
                        status: 200,
                        data: result.map(user => {
                            return {
                                ...user,
                                Avatar: user.Avatar ? user.Avatar.toString('base64') : null,
                            };
                        }),
                        pagination: {
                            page,
                            pageSize,
                            totalItems,
                            totalPages
                        }
                    });
                }
            });
        }
    });
});

router.post('/user/send-email', async (req, res) => {
    const { Email, Content } = req.body;

    if (!Email || !Content) {
        return res.status(400).json({ error: 'Email and Content are required.' });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'omari.purdy@ethereal.email',
                pass: 'MsEkEJv4kDPuhbSxsX'
            },
        });

        const mailOptions = {
            from: '"Faker Email 👻" <faker@faker.com>',
            to: Email,
            subject: 'Market go Admin Mail',
            text: Content,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Message sent: %s', info.messageId);
        res.status(200).json({ message: 'Email sent successfully', info });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

router.get('/user', (req, res) => {
    connection.query(`SELECT * FROM \`user\` WHERE UserID = ?`, [req.params.UserID], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message })
        } else {
            res.json({
                status: 200, data: {
                    ...user,
                    Avatar: user.Avatar ? user.Avatar.toString('base64') : null
                }
            })
        }
    })
})

router.delete('/user', (req, res) => { });

router.get('/recipe/all', (req, res) => {
    connection.query(`SELECT * FROM \`recipe\``, (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message })
        } else {
            res.json({ status: 200, data: result });
        }
    })
});

router.get('/recipe', (req, res) => {
    connection.query(`SELECT * FROM \`recipe\` WHERE RecipeID = ?`, [req.params.RecipeID], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message })
        } else {
            res.json({ status: 200, data: result });
        }
    })
});

router.delete('/recipe', (req, res) => { });

router.get('/group/all', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    connection.query(
        `SELECT COUNT(*) AS total 
         FROM \`group\` g
         INNER JOIN \`user\` u ON g.AdminID = u.UserID `,
        (countErr, countResult) => {
            if (countErr) {
                console.error(countErr);
                res.json({ status: 500, message: "Server error!" });
                return;
            }

            const total = countResult[0].total;

            if (total === 0) {
                res.json({ status: 404, message: "No groups found" });
                return;
            }

            connection.query(
                `SELECT g.GroupID, g.GroupName, g.AdminID, g.GroupImg, u.Username
                 FROM \`group\` g
                 INNER JOIN \`user\` u ON g.AdminID = u.UserID
                 LIMIT ? OFFSET ?`,
                [limit, offset],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        res.json({ status: 500, message: "Server error!" });
                    } else {
                        console.log(result)
                        res.json({
                            status: 200,
                            data: result,
                            total: total,
                            page: page,
                            limit: limit,
                        });
                    }
                }
            );
        }
    );
});

router.get('/group', (req, res) => {
    connection.query(`SELECT * FROM \`group\` WHERE GroupID = ?`, [req.params.GroupID], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message })
        } else {
            res.json({ status: 200, data: result });
        }
    })
});

router.delete('/group', (req, res) => { });

router.get('/item/all', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    connection.query(
        `SELECT * FROM \`item\` LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, result) => {
            if (err) {
                console.error(err);
                res.json({ status: 500, message: err.message });
            } else {
                connection.query('SELECT COUNT(*) AS total FROM `item`', (countErr, countResult) => {
                    if (countErr) {
                        console.error(countErr);
                        res.json({ status: 500, message: countErr.message });
                    } else {
                        res.json({
                            status: 200,
                            data: result,
                            total: countResult[0].total,
                            page: page,
                            limit: limit
                        });
                    }
                });
            }
        }
    );
});

router.get('/item', (req, res) => {
    connection.query(`SELECT * FROM \`item\` WHERE ItemID = ?`, [req.params.ItemID], (err, result) => {
        if (err) {
            console.error(err);
            res.json({ status: 500, message: err.message })
        } else {
            res.json({ status: 200, data: result });
        }
    })
});

router.delete('/item', (req, res) => { });

module.exports = router;