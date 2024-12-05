const { User } = require('../models');
const message = require('../utils/responseMessage');
const httpStatus = require('http-status');
const { logger } = require('../utils/logger');

const handleServiceError = (error, serviceName) => {
    logger.error(`Error in ${serviceName} service:`, error);
    return {
        message: 'Internal Server Error',
        statusCode: httpStatus.INTERNAL_SERVER_ERROR
    };
};

const userNotFoundResponse = () => ({
    message: message.USER_NOT_FOUND,
    statusCode: httpStatus.NOT_FOUND
});

const getCurrentUser = async (data) => {
    try {
        const user = await User.findByPk(data.user.id, {
            attributes: { exclude: ['password', 'confirm_password'] }
        });

        if (!user) return userNotFoundResponse();
        return user;
    } catch (error) {
        return handleServiceError(error, 'getCurrentUser');
    }
};

const getAllUsers = async () => {
    try {
        const users = await User.findAll({
            attributes: {
                exclude: ['password', 'confirm_password']
            },
            order: [['createdAt', 'DESC']]
        });
        return { users };
    } catch (error) {
        return handleServiceError(error, 'getAllUsers');
    }
};

const updateUser = async (userId, userData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) return userNotFoundResponse();

        // Remove sensitive fields from update
        const { password, confirm_password, ...updateData } = userData;

        await user.update(updateData);
        return user;
    } catch (error) {
        return handleServiceError(error, 'updateUser');
    }
};

const uploadProfilePicture = async (userId, file) => {
    try {
        if (!file) {
            return {
                message: 'No file uploaded',
                statusCode: httpStatus.BAD_REQUEST
            };
        }

        const user = await User.findByPk(userId);
        if (!user) return userNotFoundResponse();

        user.user_image = `/uploads/${file.filename}`;
        await user.save();

        return {
            user_image: user.user_image,
            message: 'Profile picture updated successfully'
        };
    } catch (error) {
        return handleServiceError(error, 'uploadProfilePicture');
    }
};

module.exports = {
    getCurrentUser,
    getAllUsers,
    updateUser,
    uploadProfilePicture
};