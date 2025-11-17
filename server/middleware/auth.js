const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in your environment.');
  }
  return process.env.JWT_SECRET;
};

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization token missing' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({ success: false, error: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;

