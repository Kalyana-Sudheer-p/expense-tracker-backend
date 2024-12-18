const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const auth = require('../middleware/auth.js');
const router = express.Router();
require('dotenv').config();

// Registration Route
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 5);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id },                    // Payload (user ID)
      process.env.JWT_SECRET,              // Secret key from .env file
      { expiresIn: '1h' }                  // Token expiration time
    );

    res.json({ token, userId: user._id });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard route (protected)
router.get('/dashboard', auth, (req, res) => {
  // Assume user data is available from auth middleware
  const userData = req.user; 
  res.json({
    message: 'Welcome to your dashboard!',
    user: userData,
  });
});

module.exports = router;
