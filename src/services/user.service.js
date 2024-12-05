const { User } = require('../models');
const message = require('../utils/responseMessage')
const httpStatus = require('http-status');
const { logger } = require('../utils/logger');

const getCurrentUser = async (data) => {
    try {
        const user = await User.findByPk(data.user.id);
        if (!user) {
            return { message: message.USER_NOT_FOUND, statusCode: httpStatus.NOT_FOUND };
        }
        return user;
    } catch (error) {
        logger.error("Error in getCurrentUser service:", error);
        return { message: 'Internal Server Error', statusCode: httpStatus.INTERNAL_SERVER_ERROR };
    }
};

const getAllUsers = async () => {
    try {
        const users = await User.findAll();
        return { users };
    } catch (error) {
        logger.error("Error in getAllUsers service:", error);
        return { message: 'Internal Server Error', statusCode: httpStatus.INTERNAL_SERVER_ERROR };
    }
};

const updateUser = async (userId, userData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return { message: message.USER_NOT_FOUND, statusCode: httpStatus.NOT_FOUND };
        }
        await user.update(userData);
        return user;
    } catch (error) {
        logger.error("Error in updateUser service:", error);
        return { message: 'Internal Server Error', statusCode: httpStatus.INTERNAL_SERVER_ERROR };
    }
};

const uploadProfilePicture = async (userId, data) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return { message: message.USER_NOT_FOUND, statusCode: httpStatus.NOT_FOUND };
        }
        user.user_image = `/uploads/${data.filename}`;
        await user.save();
        return user;
    } catch (error) {
        logger.error("Error in uploadProfilePicture service:", error);
        return { message: 'Internal Server Error', statusCode: httpStatus.INTERNAL_SERVER_ERROR };
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    updateUser,
    uploadProfilePicture
};