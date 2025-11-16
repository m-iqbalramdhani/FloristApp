const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cart = require('./Cart');
const Product = require('./Product');

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  cart_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  product_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
  qty: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  note: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(12,2), allowNull: false }
}, {
  tableName: 'cart_items',
});

CartItem.belongsTo(Cart, {
  foreignKey: { name: 'cart_id', allowNull: false },
  as: 'cart',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
CartItem.belongsTo(Product, {
  foreignKey: { name: 'product_id', allowNull: false },
  as: 'product',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});
Cart.hasMany(CartItem, {
  foreignKey: { name: 'cart_id', allowNull: false },
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

module.exports = CartItem;
