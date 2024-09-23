const ApiError = require('../utils/ApiError');
const { User } = require('../models');
const message = require('../utils/responseMessage')


const getCurrentUser = async (data) => {
    try {
        const user = await User.findByPk(data.user.id);
        if (!user) {
            throw new ApiError(404, message.USER_NOT_FOUND);
        }
        return user;
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};


const getAllUsers = async () => {
    try {
        const users = await User.findAll();
        const userData = {
            users: users
        }
        return userData;
    } catch (error) {
        throw new ApiError(500, 'Internal Server Error');
    }
};

const updateUser = async (userId, userData) => {
    try {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new ApiError(404, message.USER_NOT_FOUND);
        }
        await user.update(userData);
        return user;
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message);
    }
};

const uploadProfilePicture = async (userId, data) => {
    try {

        const user = await User.findByPk(userId);
        if (!user) {
            throw new ApiError(404, message.USER_NOT_FOUND);
        }
        // Save the file path to the user's profile_picture field
        user.user_image = `/uploads/${data.filename}`;
        await user.save();

        return user;
    } catch (error) {
        throw new ApiError(error.statusCode || 500, error.message);
    }
};



module.exports = {
    getCurrentUser,
    getAllUsers,
    updateUser,
    uploadProfilePicture
};