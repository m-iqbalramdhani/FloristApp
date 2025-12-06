const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, uploadImage, addProductImage } = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

// konfigurasi multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authMiddleware, adminOnly, upload.single('image'), create);
router.put('/:id', authMiddleware, adminOnly, upload.single('image'), update);
router.delete('/:id', authMiddleware, adminOnly, remove);
router.post('/upload-image', authMiddleware, adminOnly, upload.single('image'), uploadImage);
router.post('/:id/add-image', authMiddleware, adminOnly, upload.single('image'), addProductImage);

module.exports = router;
