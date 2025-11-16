const Product = require('../models/Product');
const Category = require('../models/Category');
const path = require('path');
const fs = require('fs');

exports.getAll = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, as: 'category', attributes: ['id', 'nama'] }],
      order: [['id', 'DESC']]
    });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    res.json({ data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama_produk, deskripsi, harga, kategori_id, stok, estimasi_waktu } = req.body;
    const newProduct = await Product.create({
      nama_produk, deskripsi, harga, kategori_id, stok, estimasi_waktu
    });
    res.status(201).json({ message: 'Produk berhasil ditambahkan', data: newProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const { nama_produk, deskripsi, harga, kategori_id, stok, status, estimasi_waktu } = req.body;
    Object.assign(product, { nama_produk, deskripsi, harga, kategori_id, stok, status, estimasi_waktu });
    await product.save();
    res.json({ message: 'Produk diperbarui', data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    await product.destroy();
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload image
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File belum diupload' });
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ message: 'Upload berhasil', file_url: url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
