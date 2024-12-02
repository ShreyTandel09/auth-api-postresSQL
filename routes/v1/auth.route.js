const express = require('express');
const validate = require('../../middleware/validate');
const authValidation = require('../../validation/authValidation');
const authController = require('../../controllers/authController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5
});

router.post('/register', validate(authValidation.validateUser), authController.register);
router.post('/login', loginLimiter, validate(authValidation.validateLoginUser), authController.login);
router.post('/resend-verify-email', validate(authValidation.validateEmail), authController.resendVerifyEmail);
router.post('/forgot-password', validate(authValidation.validateEmail), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.validateResetPassword), authController.resetPassword);

module.exports = router;