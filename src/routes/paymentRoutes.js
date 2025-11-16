const express = require('express');
const router = express.Router();
const { updateStatus } = require('../controllers/paymentController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

// Update status payment by payment id
router.put('/:id/status', authMiddleware, adminOnly, updateStatus);

module.exports = router;
