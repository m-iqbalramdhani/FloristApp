// src/seeders/createAdmin.js
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const User = require('../models/User');

(async () => {
  try {
    console.log('🔄 Menyiapkan koneksi database...');
    await sequelize.authenticate();

    const email = 'admin@bunga.com';
    const existingAdmin = await User.findOne({ where: { email } });

    if (existingAdmin) {
      console.log('⚠️ Admin sudah ada, tidak perlu membuat ulang.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Admin Toko',
      email,
      password: hashedPassword,
      role: 'admin',
      status: 1,
      phone: '081111111111'
    });

    console.log('✅ Akun admin berhasil dibuat:');
    console.log(`📧 Email: ${admin.email}`);
    console.log(`🔑 Password: admin123`);
    console.log(`🧩 Role: ${admin.role}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal membuat akun admin:', error.message);
    process.exit(1);
  }
})();
