const { sendNotification } = require('../utils/sendNotification');
const User = require('../models/User');

// Kirim notifikasi ke user
const user = await User.findByPk(req.user.id);
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
