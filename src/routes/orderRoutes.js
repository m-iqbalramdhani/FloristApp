const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateStatus,
  uploadPayment
} = require('../controllers/orderController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const sendNotification = require('../utils/sendNotificationV1');

// checkout / create order
router.post('/', authMiddleware, createOrder);

// list all orders (admin)
router.get('/', authMiddleware, getAllOrders);

// get user’s orders
router.get('/user', authMiddleware, getUserOrders);

// get specific order
router.get('/:id', authMiddleware, getOrderById);

// upload payment
router.post('/:id/upload-payment', authMiddleware, upload.single('bukti'), uploadPayment);

// update status
router.put('/:id/status', authMiddleware, updateStatus);

module.exports = router;



