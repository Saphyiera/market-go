const express = require('express');
const multer = require('multer');
const UserController = require('../controllers/user');

const router = express.Router();
const userController = new UserController();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', (req, res) => userController.getUserInfo(req, res));
router.post('/login', (req, res) => userController.login(req, res));
router.post('/signup', (req, res) => userController.signup(req, res));
router.post('/info', (req, res) => userController.updateUserInfo(req, res));
router.post('/avatar', upload.single('avatar'), (req, res) => userController.updateAvatar(req, res));

module.exports = router;