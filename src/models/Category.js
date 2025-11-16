const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  nama: { type: DataTypes.STRING(150), allowNull: false },
  deskripsi: { type: DataTypes.TEXT, allowNull: true }
}, {
  tableName: 'categories',
});

module.exports = Category;
