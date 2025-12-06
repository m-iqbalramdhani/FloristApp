const sendNotification = require('../utils/sendNotificationV1')
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const sequelize = require('../config/database');


// mapping status angka <-> teks
const STATUS_MAP = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  ready: 3,
  completed: 4,
  cancelled: 5
};
const STATUS_LABEL = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'completed',
  'cancelled'
];

// 🧾 Checkout dari cart → buat order
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user_id = req.user.id;

    const cart = await Cart.findOne({
      where: { user_id },
      include: [{ model: CartItem, as: 'items', include: ['product'] }]
    });

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Keranjang kosong' });

    // hitung total & estimasi
    let total = 0;
    let maxEstimasiJam = 0;
    cart.items.forEach(item => {
      total += item.qty * item.price;
      const ew = (item.product.estimasi_waktu || '').toString().toLowerCase();
      let jam = 0;
      if (ew.includes('hari')) {
        const n = parseInt(ew);
        jam = isNaN(n) ? 0 : n * 24;
      } else if (ew.includes('jam')) {
        const n = parseInt(ew);
        jam = isNaN(n) ? 0 : n;
      } else {
        const n = parseInt(ew);
        jam = isNaN(n) ? 0 : n; // fallback as hours
      }
      maxEstimasiJam = Math.max(maxEstimasiJam, jam);
    });

    const estimasiDate = maxEstimasiJam > 0 ? new Date(Date.now() + maxEstimasiJam * 60 * 60 * 1000) : null;

    const order = await Order.create({
      user_id,
      total_harga: total,
      status: 0, // 0=pending
      estimasi_selesai: estimasiDate
    }, { transaction: t });

    await CartItem.destroy({ where: { cart_id: cart.id }, transaction: t });
    await t.commit();

    res.status(201).json({ message: 'Pesanan berhasil dibuat', data: order });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
};

// 📦 GET semua pesanan
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'photo_url']
        },
        { model: Payment, as: 'payment' }
      ],
      order: [['id', 'DESC']]
    });

    const data = orders.map(o => ({
      ...o.toJSON(),
      status_text: STATUS_LABEL[o.status]
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 GET pesanan user login
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'photo_url']
        },
        { model: Payment, as: 'payment' }
      ],
      order: [['id', 'DESC']]
    });

    const data = orders.map(o => ({
      ...o.toJSON(),
      status_text: STATUS_LABEL[o.status]
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📦 GET detail order
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email", "phone", "photo_url"]
        },
        {
          model: Payment,
          as: "payment"
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    return res.json({
      data: {
        ...order.toJSON(),
        status_text: STATUS_LABEL[order.status]
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 💳 Upload bukti pembayaran (Customer)
exports.uploadPayment = async (req, res) => {
  try {
    const order_id = req.params.id;
    const { metode, jumlah } = req.body;
    const bukti_url = req.file ? `/uploads/${req.file.filename}` : null;

    // pastikan order milik user login
    const order = await Order.findOne({
      where: { id: order_id, user_id: req.user.id }
    });

    if (!order)
      return res.status(404).json({ message: 'Order tidak ditemukan atau bukan milik Anda' });

    const payment = await Payment.create({
      order_id,
      metode,
      jumlah,
      bukti_url,
      status: 'pending'
    });

    // Ambil user
    const user = await User.findByPk(order.user_id);

    // 🔔 Notif ke User
    if (user?.fcm_token) {
      sendNotification(
        user.fcm_token,
        "Bukti Pembayaran Berhasil Diupload",
        "Tunggu verifikasi dari admin."
      );
    }

    // 🔔 Notif ke Admin
    const admins = await User.findAll({ where: { role: "admin" } });

    admins.forEach(adm => {
      if (adm.fcm_token) {
        sendNotification(
          adm.fcm_token,
          "Bukti Pembayaran Baru",
          `Order #${order.id} mengunggah bukti pembayaran.`
        );
      }
    });

    return res.status(201).json({
      message: 'Bukti pembayaran berhasil dikirim',
      data: payment
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};


// 🔁 Update status pesanan (Admin)
// 🔁 Update status pesanan (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order tidak ditemukan' });

    let { status } = req.body;

    // Konversi status string → angka via STATUS_MAP
    if (isNaN(status)) {
      const key = String(status || '').trim().toLowerCase();
      status = STATUS_MAP[key] ?? 0;
    } else {
      status = parseInt(status);
    }

    order.status = status;
    await order.save();

    // ======================================================
    // 🔔 Kirim Notifikasi ke User
    // ======================================================
    const user = await User.findByPk(order.user_id);
    if (user?.fcm_token) {

      const NOTIF_MESSAGE = {
        0: "Pesanan menunggu pembayaran.",
        1: "Pesanan telah dikonfirmasi!",
        2: "Pesanan sedang diproses oleh florist.",
        3: "Pesanan siap diambil!",
        4: "Pesanan telah selesai. Terima kasih!",
        5: "Pesanan dibatalkan."
      };

      sendNotification(
        user.fcm_token,
        "Status Pesanan Diperbarui",
        NOTIF_MESSAGE[status] || "Status pesanan telah berubah."
      );
    }

    // Response
    res.json({
      message: 'Status pesanan diperbarui',
      data: {
        ...order.toJSON(),
        status_text: STATUS_LABEL[order.status]
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

