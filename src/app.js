const HOST = '0.0.0.0';
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const User = require('./models/User'); // inisialisasi model

const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

// Root
app.get('/', (req, res) => res.json({ message: 'Backend Bucket Bunga API is running 🚀' }));


// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Sync DB & start server
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');
    // sync models. WARNING: in production, gunakan migrasi bukan sync({ force: true })
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    await sequelize.sync(isDev ? { alter: true } : {});
    console.log('✅ Models synced');
    app.listen(PORT, HOST, () => {
    console.log(`Server running on port ${PORT}`);
});

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();
