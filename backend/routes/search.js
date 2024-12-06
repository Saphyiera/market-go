const express = require('express');
const SearchController = require('../controllers/search');

const router = express.Router();
const searchController = new SearchController();

router.post('/recipe', (req, res) => searchController.findRecipes(req, res))
router.post('/user', (req, res) => searchController.findUsers(req, res))

module.exports = router;