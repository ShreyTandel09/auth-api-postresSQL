const express = require('express');
const validate = require('../middleware/validate');
const authValidation = require('../validation/authValidation');
const authController = require('../controllers/authController');
const { getUserProfile } = require('../controllers/userController');

const isAuthenticated = require('../middleware/authMiddleware');



const router = express.Router();

// Register a new user
router.post('/register', validate(authValidation.validateUser), authController.register);
// Verify user email
router.get('/verify-email', authController.verifyEmail);
//resend Verify Email
router.post('/resend-verify-email', validate(authValidation.validateEmail), authController.resendVerifyEmail);

// Login user
router.post('/login', validate(authValidation.validateLoginUser), authController.login);
// Refresh authentication token
router.post('/refresh-token', authController.refreshToken);
// Forgot password
router.post('/forgot-password', validate(authValidation.validateEmail), authController.forgotPassword);
// Reset password
router.post('/reset-password', validate(authValidation.validateResetPassword), authController.resetPassword);
// Get user profile (protected route)
router.get('/profile', isAuthenticated, getUserProfile);


module.exports = router;
