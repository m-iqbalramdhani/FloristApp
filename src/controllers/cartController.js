const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');

// Helper: buat cart otomatis jika belum ada
async function getOrCreateCart(user_id) {
  let cart = await Cart.findOne({ where: { user_id } });
  if (!cart) {
    cart = await Cart.create({ user_id });
  }
  return cart;
}

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [{ model: Product, as: 'product' }]
    });
    res.json({ data: { cart, items } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/cart/items
exports.addItem = async (req, res) => {
  try {
    const { product_id, qty, note } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });

    const existing = await CartItem.findOne({ where: { cart_id: cart.id, product_id } });
    if (existing) {
      existing.qty += qty || 1;
      await existing.save();
      return res.json({ message: 'Kuantitas produk diperbarui', data: existing });
    }

    const item = await CartItem.create({
      cart_id: cart.id,
      product_id,
      qty: qty || 1,
      note,
      price: product.harga
    });
    res.status(201).json({ message: 'Produk ditambahkan ke keranjang', data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/cart/items/:id
exports.updateItem = async (req, res) => {
  try {
    const { qty, note } = req.body;
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });

    if (qty !== undefined) item.qty = qty;
    if (note !== undefined) item.note = note;
    await item.save();
    res.json({ message: 'Item diperbarui', data: item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/cart/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const item = await CartItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item tidak ditemukan' });
    await item.destroy();
    res.json({ message: 'Item dihapus dari keranjang' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
