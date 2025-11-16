const express = require('express');
const router = express.Router();
const { register, login, me, saveFcmToken } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.post('/save-fcm-token', authMiddleware, saveFcmToken);

module.exports = router;
