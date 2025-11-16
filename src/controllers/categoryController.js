const Category = require('../models/Category');

exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    res.json({ data: categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nama, deskripsi } = req.body;
    if (!nama) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    const newCat = await Category.create({ nama, deskripsi });
    res.status(201).json({ message: 'Kategori berhasil ditambahkan', data: newCat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    const cat = await Category.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    cat.nama = nama || cat.nama;
    cat.deskripsi = deskripsi || cat.deskripsi;
    await cat.save();
    res.json({ message: 'Kategori diperbarui', data: cat });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByPk(id);
    if (!cat) return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    await cat.destroy();
    res.json({ message: 'Kategori dihapus' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
