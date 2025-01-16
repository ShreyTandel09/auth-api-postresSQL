const { User } = require('../models');
const httpStatus = require('http-status');
const {
    createSuccessResponse,
    createBadRequestResponse,
    createNotFoundResponse,
    handleServiceError
} = require('../utils/responseHelper');

const getCurrentUser = async (data) => {
    try {
        const user = await User.findByPk(data.user.id, {
            attributes: { exclude: ['password', 'confirm_password'] }
        });

        if (!user) {
            return createNotFoundResponse('User');
        }

        return createSuccessResponse(user);
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

        return createSuccessResponse({ users });
    } catch (error) {
        return handleServiceError(error, 'getAllUsers');
    }
};

const updateUser = async (userId, userData) => {
    try {
        const user = await User.findByPk(userId);

        if (!user) {
            return createNotFoundResponse('User');
        }

        // Remove sensitive fields from update
        const { password, confirm_password, ...updateData } = userData;

        await user.update(updateData);

        // Return updated user without sensitive data
        const updatedUser = await User.findByPk(userId, {
            attributes: { exclude: ['password', 'confirm_password'] }
        });

        return createSuccessResponse(updatedUser);
    } catch (error) {
        return handleServiceError(error, 'updateUser');
    }
};

const uploadProfilePicture = async (userId, file) => {
    try {
        if (!file) {
            return createBadRequestResponse('No file uploaded');
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return createNotFoundResponse('User');
        }

        // Update user's profile picture path
        user.user_image = `/uploads/${file.filename}`;
        await user.save();

        return createSuccessResponse({
            user_image: user.user_image,
            message: 'Profile picture updated successfully'
        });
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