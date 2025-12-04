const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'iqbal17_db_florist',
  process.env.DB_USER || 'iqbal17',
  process.env.DB_PASS || 'alomani12345',
  {
    host: process.env.DB_HOST || 'mysql-iqbal17.alwaysdata.net', // GANTI INI
    dialect: 'mysql',
    port: 3306, // WAJIB TAMBAH
    logging: false,
    define: {
      timestamps: true,
    },
  }
);

module.exports = sequelize;
