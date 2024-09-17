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

module.exports = {
    getCurrentUser,
    getAllUsers
};