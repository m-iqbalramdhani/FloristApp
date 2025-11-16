const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: token missing' });
    }
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // fetch user
    const user = await User.findByPk(payload.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized: user not found' });
    req.user = user;
    next();
  } catch (err) {
    console.error('authMiddleware error:', err.message);
    return res.status(401).json({ message: 'Unauthorized: invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden: admin only' });
  next();
};

module.exports = { authMiddleware, adminOnly };
