const ApiError = require('../utils/ApiError');
const { User } = require('../models');
const message = require('../utils/responseMessage')
const httpStatus = require('http-status');
const { logger, logError } = require('../middleware/logger');


const getCurrentUser = async (data) => {
    try {
        const user = await User.findByPk(data.user.id);
        if (!user) {
            throw new ApiError(404, message.USER_NOT_FOUND);
        }
        return user;
    } catch (error) {
        logError(error, 'Error in getCurrentUser');
        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};


const getAllUsers = async () => {
    try {
        const users = await User.findAll();
        return { users };
    } catch (error) {
        logError(error, 'Error in getAllUsers');
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to fetch users');
    }
};

const updateUser = async (userId, userData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, message.USER_NOT_FOUND);
        }
        await user.update(userData);
        return user;
    } catch (error) {
        logError(error, 'Error in updateUser');
        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};

const uploadProfilePicture = async (userId, data) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ApiError(httpStatus.NOT_FOUND, message.USER_NOT_FOUND);
        }
        user.user_image = `/uploads/${data.filename}`;
        await user.save();
        return user;
    } catch (error) {
        logError(error, 'Error in uploadProfilePicture');
        throw new ApiError(error.statusCode || httpStatus.INTERNAL_SERVER_ERROR, error.message);
    }
};



module.exports = {
    getCurrentUser,
    getAllUsers,
    updateUser,
    uploadProfilePicture
};