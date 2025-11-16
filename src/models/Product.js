const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Category = require('./Category');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  nama_produk: { type: DataTypes.STRING(200), allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true },
  harga: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  foto_url: { type: DataTypes.STRING(512), allowNull: true },
  status: { type: DataTypes.ENUM('active','inactive'), defaultValue: 'active' },
  stok: { type: DataTypes.INTEGER, defaultValue: 0 },
  estimasi_waktu: { type: DataTypes.STRING(50), allowNull: true }
}, {
  tableName: 'products',
});

Product.belongsTo(Category, { foreignKey: 'kategori_id', as: 'category' });
Category.hasMany(Product, { foreignKey: 'kategori_id', as: 'products' });

module.exports = Product;
