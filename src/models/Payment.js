const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.BIGINT, allowNull: false },
  metode: { type: DataTypes.STRING(50), allowNull: false },
  jumlah: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  bukti_url: { type: DataTypes.STRING(512), allowNull: true },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'payments',
  timestamps: true
});

Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = Payment;
