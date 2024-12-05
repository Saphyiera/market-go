const StatisticRepository = require('../repositories/statistic');

class StatisticService {
    constructor() {
        this.statisticRepository = new StatisticRepository();
    }

    async getStatistic(userId, startDate, endDate) {
        const result = await this.statisticRepository.getStatistic(userId, startDate, endDate);
        return result;
    }
}
module.exports = StatisticService