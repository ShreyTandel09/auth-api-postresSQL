const { User, RefreshToken } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const httpStatus = require('http-status');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const ApiError = require('../utils/ApiError');
const { sendEmailVerification, sendResetEmail } = require('../utils/email');
const { generateToken, generateRefreshToken } = require('../utils/jwtToken');
const { logger, logError } = require('../utils/logger');

const registerUser = async (data) => {
    try {
        const { first_name, last_name, email, password } = data;
        if (!first_name || !last_name || !email || !password) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'All fields are required');
        }

        const transaction = await sequelize.transaction();
        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new ApiError(httpStatus.BAD_REQUEST, 'User Already Exists');
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = await User.create({
                first_name,
                last_name,
                email,
                password: hashedPassword,
                confirm_password: hashedPassword
            }, { transaction });

            await sendEmailVerification(newUser);
            console.log("newUser", newUser);
            await transaction.commit();

            return newUser;
        } catch (error) {
            console.log("error", error);
            await transaction.rollback();
            throw error instanceof ApiError ? error :
                new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
        }
    } catch (error) {
        logger.error('Error in registerUser', {
            error: error.message,
            stack: error.stack
        });
        throw error instanceof ApiError ? error :
            new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};


const verifyUser = async (data) => {
    try {
        const { token } = data;
        // Should check if token is expired
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET, {
            ignoreExpiration: false
        });
        const { email } = decodedToken;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'Invalid or expired token', statusCode: 400 };

        }
        //user is verified here
        user.isVerified = true;
        await user.save();
        return user;

    } catch (error) {
        console.error("Error in VerifyUser:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}


const resendVerifyUserEmail = async (data) => {
    try {
        const { email } = data;

        let user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'User not found', statusCode: 400 };

        }
        if (user.isVerified) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already verified');
        }
        sendEmailVerification(user);
        return user;

    } catch (error) {
        console.error("Error in resendVerifyUserEmail:", error);
        return { message: 'Internal Server Error', statusCode: 500 };
    }
}

const loginUser = async (email, password) => {
    try {
        // Input validation
        if (!email || !password) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Email and password are required');
        }

        // Find user with select fields only
        const user = await User.findOne({
            where: { email },
            attributes: ['id', 'email', 'password', 'isVerified'],
            raw: true
        });

        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid password');
        }

        if (!user.isVerified) {
            throw new ApiError(httpStatus.BAD_REQUEST, 'Please verify your email');
        }

        const transaction = await sequelize.transaction();
        try {
            // Generate tokens
            const token = generateToken(user);
            const refreshToken = generateRefreshToken(user);

            // Save refresh token
            await RefreshToken.create({
                token: refreshToken,
                userId: user.id,
            }, { transaction });

            await transaction.commit();

            // Remove password from response
            delete user.password;

            return { user, token, refreshToken };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    } catch (error) {
        logError(error, 'Error in loginUser');
        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};


const refreshTokenService = async (data) => {
    const { refreshToken } = data;
    if (!refreshToken) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Refresh token is required');
    }
    try {
        // Clean up expired tokens
        await RefreshToken.destroy({
            where: {
                createdAt: {
                    [Op.lt]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days
                }
            }
        });

        const refreshTokenData = await RefreshToken.findOne({
            where: { token: refreshToken },
            attributes: ['userId', 'token']
        });
        if (!refreshTokenData) {
            return { message: 'Invalid refresh token', statusCode: 401 };
        }

        const user = await User.findByPk(refreshTokenData.userId);
        if (!user) {
            return { message: 'User not found', statusCode: 404 };
        }
        const newAccessToken = generateToken(user);

        const resData = {
            user,
            token: newAccessToken,
            refreshToken: refreshToken
        }
        return resData;
    } catch (error) {
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
    }
}


const forgotPasswordService = async (data) => {
    try {
        const { email } = data;
        let user = await User.findOne({ where: { email } });
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
        }
        await sendResetEmail(user);
        return user;
    } catch (error) {
        logError(error, 'Error in forgotPasswordService');
        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const resetPasswordService = async (data) => {
    const { token, password } = data;

    // Verify token and check expiration
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (Date.now() >= payload.exp * 1000) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Reset token has expired');
    }

    // Use transaction for password update
    const transaction = await sequelize.transaction();
    try {
        const user = await User.findByPk(payload.userId);
        await user.update({
            password: await bcrypt.hash(password, 10)
        }, { transaction });

        // Invalidate all existing sessions
        await RefreshToken.destroy({
            where: { userId: user.id },
            transaction
        });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};


module.exports = {
    loginUser,
    verifyUser,
    resendVerifyUserEmail,
    registerUser,
    refreshTokenService,
    forgotPasswordService,
    resetPasswordService
};
