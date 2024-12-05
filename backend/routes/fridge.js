const express = require('express');
const FridgeController = require('../controllers/fridge');

const router = express.Router();
const fridgeController = new FridgeController();

router.get('/', (req, res) => fridgeController.getFridgeItems(req, res));
router.delete('/all', (req, res) => fridgeController.deleteAllItems(req, res));
router.delete('/item', (req, res) => fridgeController.deleteItem(req, res));
router.post('/item', (req, res) => fridgeController.addItem(req, res));

module.exports = router;
