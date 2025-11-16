const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  total_harga: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  status: { type: DataTypes.INTEGER, defaultValue: 0 },
  estimasi_selesai: { type: DataTypes.DATE, allowNull: true },
  catatan: { type: DataTypes.STRING(255), allowNull: true }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Order;
