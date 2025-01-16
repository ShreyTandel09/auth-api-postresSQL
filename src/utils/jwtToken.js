require('dotenv').config();
const jwt = require('jsonwebtoken');
const logger = require('./logger');

function generateToken(user, emailToken = false) {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not configured');
        }

        const options = {};
        const payload = {
            id: user.id.toString(),
            email: user.email,
            name: user.first_name,
            uniqueKey: process.env.UNIQUE_KEY
        };

        if (emailToken) {
            options.expiresIn = '5h';
        }

        return jwt.sign(payload, process.env.JWT_SECRET, options);
    } catch (error) {
        logger.error('Error generating token:', error);
        throw error;
    }
}

function generateRefreshToken(user) {
    try {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error('REFRESH_TOKEN_SECRET is not configured');
        }

        const payload = {
            email: user.email,
            name: user.first_name,
            uniqueKey: process.env.UNIQUE_KEY
        };

        return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
            expiresIn: '7d'
        });
    } catch (error) {
        logger.error('Error generating refresh token:', error);
        throw error;
    }
}

module.exports = {
    generateToken,
    generateRefreshToken
};