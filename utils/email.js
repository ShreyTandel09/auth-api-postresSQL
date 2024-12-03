require('dotenv').config();
const nodemailer = require('nodemailer');
const jwtToken = require('../utils/jwtToken');
const { logger, logError } = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

// Create and return a Nodemailer transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // Use 465 for SSL
        secure: true, // Use secure connection
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // logger: true, // Enables debugging output
        // debug: true, // Enables debugging output
    });
};

// Send email verification
const sendEmailVerification = async (user) => {
    try {
        const token = jwtToken.generateToken(user, true); // Generate token for verification
        const html = getVerificationEmailHTML(user, token);

        const transporter = createTransporter();

        // Send verification email
        await transporter.sendMail({
            from: process.env.SMTP_USER, // Ensure this matches SMTP_USER
            to: user.email,
            subject: 'Verify Your Email',
            html: html,
        });

        logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
        logError(error, 'Email sending failed');
        // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification email');
    }
};

// Send reset password email
const sendResetEmail = async (user) => {
    try {
        const token = jwtToken.generateToken(user, true); // Generate token for password reset
        const html = getRestEmailHTML(user, token);

        const transporter = createTransporter();

        // Send reset password email
        await transporter.sendMail({
            from: process.env.SMTP_USER, // Ensure this matches SMTP_USER
            to: user.email,
            subject: 'Reset Your Password',
            html: html,
        });

        logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
        logError(error, 'Password reset email sending failed');
        // throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send password reset email');
    }
};

// Generate verification email HTML
function getVerificationEmailHTML(user, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${token}`;
    return `
        <h1>Email Verification</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you did not register for this account, please ignore this email.</p>
    `;
}

// Generate reset email HTML
function getRestEmailHTML(user, token) {
    const resetLink = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${token}`;
    return `
        <h1>Reset Password</h1>
        <p>Hi ${user.name},</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
    `;
}

module.exports = {
    sendEmailVerification,
    sendResetEmail,
};
