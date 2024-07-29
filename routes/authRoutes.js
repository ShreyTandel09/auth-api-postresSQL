const express = require('express');
const { register, login, verifyEmail, refreshToken, forgotPassword, resetPassword } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
//Verify User
router.get('/verify-email', verifyEmail);
//login 
router.post('/login', login);
//refresh-token
router.post('/refresh-token', refreshToken);

//forget-password
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
