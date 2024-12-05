const IStatistic = require("../interfaces/statistic")
const connection = require('../db/connection');

class StatisticRepository extends IStatistic {
    async getStatistic(userId, startDate, endDate) {
        const query = `
        SELECT dl.DateToBuy, dl.Cost, li.ListID, li.ItemID, li.Amount, i.ItemName
        FROM dailylist dl INNER JOIN listitem li ON dl.ListID = li.ListID INNER JOIN item i ON li.ItemID = i.ItemID
        WHERE dl.UserID = ? AND dl.DateToBuy BETWEEN ? AND ?
        ORDER BY dl.DateToBuy
        `;
        return new Promise((resolve, reject) => {
            connection.query(query, [userId, startDate, endDate], (err, result) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(result)
                }
            })
        })
    }
}

module.exports = StatisticRepository