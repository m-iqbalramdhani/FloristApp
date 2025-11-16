const express = require('express');
const router = express.Router();
const { generateInvoice, getInvoiceDetail, downloadInvoice } = require('../controllers/invoiceController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/generate', authMiddleware, generateInvoice);
router.get('/:id', authMiddleware, getInvoiceDetail);
router.get('/:id/download', authMiddleware, downloadInvoice);

module.exports = router;
