const express = require('express')
const cors = require('cors')
const connection = require('./db/connection')

const userRouter = require('./routes/user')
const itemRouter = require('./routes/item')
const fridgeRouter = require('./routes/fridge')
const statisticRouter = require('./routes/statistic')
const searchRouter = require('./routes/search')
const recipeRouter = require('./routes/recipe')
const dailyListRouter = require('./routes/dailyList')
const dishPlanRouter = require('./routes/dishPlan')
const groupListRouter = require('./routes/groupList')
const groupRouter = require('./routes/group');
const adminRouter = require('./routes/admin')

const app = express()
app.use(express.json())
app.use(cors())

app.listen(port = 2811, () => {
    console.log(`Server is listening on http:/localhost:${port}`)
})

app.use('/user', userRouter);
app.use('/item', itemRouter);
app.use('/fridge', fridgeRouter);
app.use('/statistic', statisticRouter);
app.use('/search', searchRouter);
app.use('/recipe', recipeRouter);
app.use('/daily-list', dailyListRouter);
app.use('/dish-plan', dishPlanRouter);
app.use('/group-list', groupListRouter);
app.use('/group', groupRouter);
app.use('/admin', adminRouter);

app.delete('/list-item', (req, res) => {
    const { dateToBuy, itemName } = req.body;

    if (!dateToBuy || !itemName) {
        return res.status(400).json({ status: 400, message: "dateToBuy and itemName are required" });
    }

    connection.query(
        'SELECT listitem.ListID, listitem.ItemID FROM listitem JOIN dailylist ON listitem.ListID = dailylist.ListID JOIN item ON listitem.ItemID = item.ItemID WHERE dailylist.DateToBuy = ? AND item.ItemName = ?',
        [dateToBuy, itemName],
        (err, results) => {
            if (err) {
                console.error('Error fetching data:', err);
                return res.status(500).json({ status: 500, message: 'Error fetching data' });
            }

            if (results.length === 0) {
                return res.status(404).json({ status: 404, message: "No matching item found" });
            }

            const { ListID, ItemID } = results[0];

            connection.query(
                'DELETE FROM listitem WHERE ListID = ? AND ItemID = ?',
                [ListID, ItemID],
                (err, result) => {
                    if (err) {
                        console.error('Error deleting list item:', err);
                        return res.status(500).json({ status: 500, message: 'Error deleting list item' });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({ status: 404, message: "List item not found" });
                    }

                    connection.query(
                        'DELETE FROM grouplist WHERE ListID = ?',
                        [ListID],
                        (err, deleteGrouplistResult) => {
                            if (err) {
                                console.error('Error deleting from grouplist:', err);
                                return res.status(500).json({ status: 500, message: 'Error deleting from grouplist' });
                            }

                            connection.query(
                                'SELECT COUNT(*) AS count FROM listitem WHERE ListID = ?',
                                [ListID],
                                (err, countResult) => {
                                    if (err) {
                                        console.error('Error checking remaining list items:', err);
                                        return res.status(500).json({ status: 500, message: 'Error checking remaining list items' });
                                    }

                                    const count = countResult[0].count;

                                    if (count === 0) {
                                        connection.query(
                                            'DELETE FROM dailylist WHERE ListID = ?',
                                            [ListID],
                                            (err, deleteResult) => {
                                                if (err) {
                                                    console.error('Error deleting daily list:', err);
                                                    return res.status(500).json({ status: 500, message: 'Error deleting daily list' });
                                                }

                                                return res.status(200).json({
                                                    status: 200,
                                                    message: 'List item deleted, grouplist removed, and daily list removed successfully',
                                                });
                                            }
                                        );
                                    } else {
                                        return res.status(200).json({
                                            status: 200,
                                            message: 'List item deleted and grouplist removed successfully',
                                        });
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }
    );
});