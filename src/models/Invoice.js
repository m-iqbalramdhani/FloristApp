const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Order = require('./Order');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  nomor_invoice: { type: DataTypes.STRING(50), allowNull: false },
  tanggal: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  total: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, {
  tableName: 'invoices'
});

Order.hasOne(Invoice, { foreignKey: 'order_id', as: 'invoice' });
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = Invoice;
