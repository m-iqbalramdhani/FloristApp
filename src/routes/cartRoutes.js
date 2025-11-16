const express = require('express');
const router = express.Router();
const { getCart, addItem, updateItem, deleteItem } = require('../controllers/cartController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, getCart);
router.post('/items', authMiddleware, addItem);
router.put('/items/:id', authMiddleware, updateItem);
router.delete('/items/:id', authMiddleware, deleteItem);

module.exports = router;
