const Order = require('../models/Order');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const User = require('../models/User');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { generateInvoiceNumber } = require('../utils/invoiceGenerator');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

// Generate invoice setelah payment verified
exports.generateInvoice = async (req, res) => {
  try {
    const { order_id } = req.body;

    const order = await Order.findByPk(order_id, {
      include: [
        { model: Payment, as: 'payment' },
        { model: User, as: 'user' }
      ]
    });

    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });
    if (!order.payment || order.payment.status !== 'verified')
      return res.status(400).json({ message: 'Pembayaran belum diverifikasi' });

    // buat nomor invoice
    const nomor = generateInvoiceNumber(order.id);

    const invoice = await Invoice.create({
      order_id: order.id,
      nomor_invoice: nomor,
      total: order.total_harga
    });

    res.status(201).json({ message: 'Invoice berhasil dibuat', data: invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET detail invoice
exports.getInvoiceDetail = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: User, as: 'user' }, { model: Payment, as: 'payment' }]
        }
      ]
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

    res.json({ data: invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Download PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        {
          model: Order,
          as: 'order',
          include: [{ model: User, as: 'user' }, { model: Payment, as: 'payment' }]
        }
      ]
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.nomor_invoice}.pdf`);

    doc.fontSize(22).text("INVOICE", { align: 'center' });
    doc.text("========================================");
    doc.fontSize(12);

    doc.text(`Nomor Invoice: ${invoice.nomor_invoice}`);
    doc.text(`Tanggal: ${invoice.tanggal}`);
    doc.text(`Order ID: ${invoice.order_id}`);
    doc.text(`Nama: ${invoice.order.user.name}`);
    doc.text(`Email: ${invoice.order.user.email}`);
    doc.text(`Total: Rp ${invoice.total}`);

    doc.end();
    doc.pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
