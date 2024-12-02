require('dotenv').config();
const nodemailer = require('nodemailer');
const jwtToken = require('../utils/jwtToken');
const { logger } = require('../middleware/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_FROM_ADDRESS,
            pass: process.env.MAIL_PASSWORD
        }
    });
};

const sendEmailVerification = async (user) => {
    try {
        const token = jwtToken.generateToken(user, true);
        const html = getVerificationEmailHTML(user, token);

        const transporter = createTransporter();
        await transporter.sendMail({
            from: process.env.MAIL_FROM_ADDRESS,
            to: user.email,
            subject: 'Verify Your Email',
            html: html
        });

        logger.info(`Verification email sent to ${user.email}`);
    } catch (error) {
        logger.error('Email sending failed:', { error: error.message, stack: error.stack });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to send verification email');
    }
};

function sendResetEmail(user) {
    const token = jwtToken.generateToken(user, emailToken = true);

    const html = getRestEmailHTML(user, token);
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_FROM_ADDRESS, // Replace with your email
            pass: process.env.MAIL_PASSWORD // Replace with your email password
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: user.email,
        subject: 'Reset Your Password',
        text: `Hi ${user.name}, please reset your password by clicking the following link: ${process.env.FRONTEND_URL}/api/auth/reset-password?token=${token}`,
        html: html
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(`Error: ${error}`);
        }
        console.log(`Message Sent: ${info.response}`);
    });


}


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


function getRestEmailHTML(user, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${token}`;

    return `
        <h1>Reset Password</h1>
        <p>Hi ${user.name},</p>
        <p> Please click the link below to reset password:</p>
        <a href="${verificationLink}">Reset password</a>
        <p>If you did not register for this account, please ignore this email.</p>
    `;
}

exports.sendEmailVerification = sendEmailVerification;
exports.sendResetEmail = sendResetEmail;
