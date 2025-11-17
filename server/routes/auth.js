const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please set it in your environment.');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (userId) => {
  return jwt.sign({ userId }, getJwtSecret(), { expiresIn: '7d' });
};

const sanitizeEmail = (email) => email.trim().toLowerCase();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = sanitizeEmail(req.body.email);
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'Email is already registered' });
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
      });

      const token = generateToken(user._id.toString());

      res.status(201).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Failed to register user' });
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const email = sanitizeEmail(req.body.email);
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }

      const token = generateToken(user._id.toString());

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Failed to login' });
    }
  }
);

module.exports = router;

