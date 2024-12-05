const StatisticService = require('../services/statistic');

class StatisticController {
    constructor() {
        this.statisticService = new StatisticService();
    }

    async getStatistic(req, res) {
        try {
            const { userId, startDate, endDate } = req.query;
            const result = await this.statisticService.getStatistic(userId, startDate, endDate);
            res.json({ status: 200, data: result });

        } catch (error) {
            res.json({ status: 500, message: "Server Error" });
        }
    }
}

module.exports = StatisticController