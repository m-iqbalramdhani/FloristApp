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

    // Siapkan data produk
    const productData = {
      nama_produk,
      deskripsi,
      harga,
      kategori_id,
      stok,
      estimasi_waktu
    };

    // Jika ada file yang diupload, tambahkan foto_url
    if (req.file) {
      productData.foto_url = `/uploads/${req.file.filename}`;
    }

    const newProduct = await Product.create(productData);
    res.status(201).json({
      message: 'Produk berhasil ditambahkan',
      data: newProduct
    });
  } catch (err) {
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      // Hapus file yang sudah diupload jika produk tidak ditemukan
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    const { nama_produk, deskripsi, harga, kategori_id, stok, status, estimasi_waktu } = req.body;

    // Update data produk
    Object.assign(product, { nama_produk, deskripsi, harga, kategori_id, stok, status, estimasi_waktu });

    // Jika ada file baru yang diupload
    if (req.file) {
      // Hapus foto lama jika ada
      if (product.foto_url) {
        const oldFileName = product.foto_url.replace('/uploads/', '');
        const oldFilePath = path.join(__dirname, '../../uploads', oldFileName);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Set foto_url baru
      product.foto_url = `/uploads/${req.file.filename}`;
    }

    await product.save();
    res.json({ message: 'Produk diperbarui', data: product });
  } catch (err) {
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
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

// Menambahkan foto produk
exports.addProductImage = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      // Hapus file yang sudah diupload jika produk tidak ditemukan
      if (req.file) {
        const filePath = path.join(__dirname, '../../uploads', req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'File foto belum diupload' });
    }

    // Hapus foto lama jika ada
    if (product.foto_url) {
      const oldFileName = product.foto_url.replace('/uploads/', '');
      const oldFilePath = path.join(__dirname, '../../uploads', oldFileName);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Update foto_url produk
    const foto_url = `/uploads/${req.file.filename}`;
    product.foto_url = foto_url;
    await product.save();

    res.status(200).json({
      message: 'Foto produk berhasil ditambahkan',
      data: product
    });
  } catch (err) {
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    res.status(500).json({ message: err.message });
  }
};
