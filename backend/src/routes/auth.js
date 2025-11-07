const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (auth required)
router.get('/profile', auth, getProfile);

module.exports = router;
