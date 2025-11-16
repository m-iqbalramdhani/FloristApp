const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('customer', 'admin'),
    defaultValue: 'customer',
  },
  status: {
    type: DataTypes.TINYINT,
    defaultValue: 1,
  },
  photo_url: {
    type: DataTypes.STRING(512),
    allowNull: true,
  },
  fcm_token: {
    type: DataTypes.STRING(512),
    allowNull: true,
  }
}, {
  tableName: 'users',
});

module.exports = User;
