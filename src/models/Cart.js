const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false, // user_id wajib ada (cart milik user)
  },
}, {
  tableName: 'carts',
});

Cart.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasOne(Cart, {
  foreignKey: 'user_id',
  as: 'cart',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


module.exports = Cart;
