const { User, RefreshToken } = require('../models');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmailVerification, sendResetEmail } = require('../utils/email');
const { generateToken, generateRefreshToken } = require('../utils/jwtToken');
const logger = require('../utils/logger');

// Helper functions
const createErrorResponse = (message, statusCode) => ({
    success: false,
    message,
    statusCode
});

const createSuccessResponse = (data, statusCode = httpStatus.OK) => ({
    success: true,
    statusCode,
    data
});

const handleServiceError = (error, serviceName) => {
    logger.error(`Error in ${serviceName} service:`, error);
    return createErrorResponse('Internal Server Error', httpStatus.INTERNAL_SERVER_ERROR);
};

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const registerUser = async (data) => {
    try {
        const { first_name, last_name, email, password } = data;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return createErrorResponse('User Already Exist!', httpStatus.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            confirm_password: hashedPassword
        });

        const verificationToken = await sendEmailVerification(newUser);

        return createSuccessResponse({
            id: newUser.id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            isVerified: newUser.isVerified,
            verificationToken
        }, httpStatus.CREATED);
    } catch (error) {
        return handleServiceError(error, 'registerUser');
    }
};

const verifyUser = async (token) => {
    try {
        if (!token) {
            return createErrorResponse('Token is required', httpStatus.BAD_REQUEST);
        }

        const tokenString = typeof token === 'object' ? token.token : token;

        try {
            const decoded = jwt.verify(tokenString, process.env.JWT_SECRET);
            const user = await User.findOne({ where: { email: decoded.email } });

            if (!user) {
                return createErrorResponse('User not found', httpStatus.NOT_FOUND);
            }

            if (user.isVerified) {
                return createErrorResponse('Email already verified', httpStatus.BAD_REQUEST);
            }

            await user.update({ isVerified: true });

            return createSuccessResponse({
                id: user.id,
                email: user.email,
                isVerified: true
            });
        } catch (jwtError) {
            return createErrorResponse('Invalid verification token', httpStatus.BAD_REQUEST);
        }
    } catch (error) {
        return handleServiceError(error, 'verifyUser');
    }
};

const resendVerifyUserEmail = async (data) => {
    try {
        const { email } = data;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return createErrorResponse('User not found', httpStatus.NOT_FOUND);
        }

        if (user.isVerified) {
            return createErrorResponse('Email already verified', httpStatus.BAD_REQUEST);
        }

        const verificationToken = await sendEmailVerification(user);

        return createSuccessResponse({
            id: user.id,
            email: user.email,
            verificationToken
        });
    } catch (error) {
        return handleServiceError(error, 'resendVerifyUserEmail');
    }
};

const loginUser = async (email, password) => {
    try {
        const user = await User.findOne({ where: { email }, raw: true });

        if (!user) {
            return createErrorResponse('User not found', httpStatus.NOT_FOUND);
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return createErrorResponse('Invalid Credentials!', httpStatus.BAD_REQUEST);
        }

        if (!user.isVerified) {
            return createErrorResponse('Please verify your email!', httpStatus.BAD_REQUEST);
        }

        const token = generateToken(user);
        const refreshToken = generateRefreshToken(user);

        await RefreshToken.create({
            token: refreshToken,
            userId: user.id,
        });

        return createSuccessResponse({
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                isVerified: user.isVerified
            },
            token,
            refreshToken
        });
    } catch (error) {
        return handleServiceError(error, 'loginUser');
    }
};

const refreshTokenService = async (data) => {
    try {
        const { refreshToken } = data;

        if (!refreshToken) {
            return createErrorResponse('Refresh token is required', httpStatus.UNAUTHORIZED);
        }

        const refreshTokenData = await RefreshToken.findOne({ where: { token: refreshToken } });
        if (!refreshTokenData) {
            return createErrorResponse('Invalid refresh token', httpStatus.UNAUTHORIZED);
        }

        const user = await User.findByPk(refreshTokenData.userId);
        if (!user) {
            return createErrorResponse('User not found', httpStatus.NOT_FOUND);
        }

        const newAccessToken = generateToken(user);
        return createSuccessResponse({
            user,
            token: newAccessToken,
            refreshToken
        });
    } catch (error) {
        return handleServiceError(error, 'refreshToken');
    }
};

const forgotPasswordService = async (data) => {
    try {
        const { email } = data;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return createErrorResponse('User not found', httpStatus.BAD_REQUEST);
        }

        await sendResetEmail(user);
        return createSuccessResponse({ email: user.email });
    } catch (error) {
        return handleServiceError(error, 'forgotPassword');
    }
};

const resetPasswordService = async (data) => {
    try {
        const { token } = data.query;
        const { password } = data.body;

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email } = decodedToken;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return createErrorResponse('Invalid or expired token', httpStatus.BAD_REQUEST);
        }

        const hashedPassword = await hashPassword(password);
        await user.update({
            password: hashedPassword,
            confirm_password: hashedPassword
        });

        return createSuccessResponse({ message: 'Password reset successful' });
    } catch (error) {
        return handleServiceError(error, 'resetPassword');
    }
};

module.exports = {
    registerUser,
    verifyUser,
    resendVerifyUserEmail,
    loginUser,
    refreshTokenService,
    forgotPasswordService,
    resetPasswordService
};