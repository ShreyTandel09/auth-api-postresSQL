const { User, RefreshToken } = require('../models');
const httpStatus = require('http-status');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailVerification, sendResetEmail } = require('../utils/email');
const { generateToken, generateRefreshToken } = require('../utils/jwtToken');

const ApiError = require('../utils/ApiError');


const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email }, raw: true }); // Ensure raw: true for plain object

        if (!user) {
            return { message: 'User not found', statusCode: 404 };
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return { message: 'Invalid password!', statusCode: 400 };
        }

        if (!user.isVerified) {
            return { message: 'Please verify your email!', statusCode: 400 };
        }

        // Generate tokens
        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token
        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
        });

        // Return plain data with statusCode for success
        return {
            user,
            token,
            refreshToken,
        };
    } catch (error) {
        console.log("Error in loginUser service:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
};

module.exports = {
    loginUser
};
