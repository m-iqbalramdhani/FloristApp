const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const generateToken = (user) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
  return token;
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, password required' });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone, role: 'customer' });

    const token = generateToken(user);
    return res.status(201).json({ message: 'User registered', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password required' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ message: 'Login successful', data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const me = async (req, res) => {
  try {
    const user = req.user;
    // hide password
    const { id, name, email, phone, role, status, photo_url, fcm_token, createdAt, updatedAt } = user;
    return res.json({ data: { id, name, email, phone, role, status, photo_url, fcm_token, createdAt, updatedAt } });
  } catch (err) {
    console.error('me error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const saveFcmToken = async (req, res) => {
  try {
    const { fcm_token } = req.body;
    if (!fcm_token) return res.status(400).json({ message: 'fcm_token required' });

    req.user.fcm_token = fcm_token;
    await req.user.save();
    return res.json({ message: 'FCM token saved' });
  } catch (err) {
    console.error('saveFcmToken error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { register, login, me, saveFcmToken };
