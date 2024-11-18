const express = require('express');
const validate = require('../middleware/validate');
const authValidation = require('../validation/authValidation');
const authController = require('../controllers/authController');

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication related endpoints
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 minLength: 3
 *                 example: John
 *               last_name:
 *                 type: string
 *                 minLength: 3
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Password123
 *               confirm_password:
 *                 type: string
 *                 example: Password123
 *             required:
 *               - first_name
 *               - last_name
 *               - email
 *               - password
 *               - confirm_password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', validate(authValidation.validateUser), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: Password123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validate(authValidation.validateLoginUser), authController.login);

/**
 * @swagger
 * /auth/resend-verify-email:
 *   post:
 *     summary: Resend email verification link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: Validation error
 */
router.post('/resend-verify-email', validate(authValidation.validateEmail), authController.resendVerifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Password reset email sent
 *       400:
 *         description: Validation error
 */
router.post('/forgot-password', validate(authValidation.validateEmail), authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: NewPassword123
 *               confirm_password:
 *                 type: string
 *                 example: NewPassword123
 *             required:
 *               - password
 *               - confirm_password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error
 */
router.post('/reset-password', validate(authValidation.validateResetPassword), authController.resetPassword);


module.exports = router;
