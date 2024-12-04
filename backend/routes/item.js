const express = require('express');
const multer = require('multer');
const ItemController = require('../controllers/item');

const router = express.Router();
const itemController = new ItemController();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', (req, res) => itemController.getItem(req, res));
router.get('/all', (req, res) => itemController.getAllItems(req, res));
router.post('/', upload.single('image'), (req, res) => itemController.addItem(req, res));

module.exports = router;
