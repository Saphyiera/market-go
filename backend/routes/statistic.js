const express = require('express');
const StatisticController = require('../controllers/statistic');

const router = express.Router();
const statisticController = new StatisticController();

router.get('/', (req, res) => statisticController.getStatistic(req, res))

module.exports = router