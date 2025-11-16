const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { sendNotification } = require('../utils/sendNotificationV1');

// PUT /api/payments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment tidak ditemukan' });

    const allowed = ['pending', 'verified', 'rejected'];
    const { status } = req.body;
    const s = String(status || '').trim().toLowerCase();
    if (!allowed.includes(s)) {
      return res.status(400).json({ message: `Status payment tidak valid. Gunakan salah satu: ${allowed.join(', ')}` });
    }

    payment.status = s;
    await payment.save();

    // Opsional: jika payment diverifikasi, Anda bisa mengubah status order di sini
    // const order = await Order.findByPk(payment.order_id);
    // if (order && s === 'verified' && order.status < 1) {
    //   order.status = 1; // confirmed
    //   await order.save();
    // }

    // Kirim notifikasi ke user
    const user = await User.findByPk(payment.order.user_id);
    if (user.fcm_token) {
      sendNotification(
        user.fcm_token,
        "Pesanan Berhasil Dibuat",
        "Pesanan Anda sedang menunggu pembayaran."
      );
    }

    // Kirim notifikasi ke admin
    const admins = await User.findAll({ where: { role: "admin" } });
    admins.forEach(adm => {
      if (adm.fcm_token) {
        sendNotification(
          adm.fcm_token,
          "Order Baru Masuk",
          `Order #${order.id} menunggu konfirmasi.`
        );
      }
    });

    res.json({ message: 'Status pembayaran diperbarui', data: payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  const payment = await Payment.findByPk(req.params.id);
  if (!payment) return res.status(404).json({ message: "Payment tidak ditemukan" });

  payment.status = "verified";
  await payment.save();

  const order = await Order.findByPk(payment.order_id);
  const user = await User.findByPk(order.user_id);

  // Notifikasi ke user
  sendNotification(
    user.fcm_token,
    "Pembayaran Dikonfirmasi",
    `Pembayaran untuk Order #${order.id} telah diverifikasi.`
  );

  res.json({ message: "Payment diverifikasi", data: payment });
};

