const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/categoryController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', getAll);
router.post('/', authMiddleware, adminOnly, create);
router.put('/:id', authMiddleware, adminOnly, update);
router.delete('/:id', authMiddleware, adminOnly, remove);

module.exports = router;
    