const express = require('express');
const { register, login, verifyEmail, refreshToken, forgotPassword, resetPassword } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController');

const isAuthenticated = require('../middleware/authMiddleware');



const router = express.Router();

// Register a new user
router.post('/register', register);
// Verify user email
router.get('/verify-email', verifyEmail);
// Login user
router.post('/login', login);
// Refresh authentication token
router.post('/refresh-token', refreshToken);
// Forgot password
router.post('/forgot-password', forgotPassword);
// Reset password
router.post('/reset-password', resetPassword);
// Get user profile (protected route)
router.get('/profile', isAuthenticated, getUserProfile);


module.exports = router;
