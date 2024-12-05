const httpStatus = require('http-status');
const userService = require('../services/user.service');
const message = require('../utils/responseMessage');
const { handleResponse, handleError } = require('../utils/responseHandler');

const getUserProfile = async (req, res) => {
    try {
        const data = await userService.getCurrentUser(req);
        handleResponse(res, data, message.USER_PROFILE_FETCH);
    } catch (error) {
        handleError(res, error, 'getUserProfile');
    }
};

const getAllUsers = async (req, res) => {
    try {
        const data = await userService.getAllUsers();
        handleResponse(res, data, message.USER_ALL);
    } catch (error) {
        handleError(res, error, 'getAllUsers');
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const data = await userService.updateUser(req.user.id, req.body);
        handleResponse(res, data, message.USER_UPDATE);
    } catch (error) {
        handleError(res, error, 'updateUserProfile');
    }
};

const updateUserProfilePicture = async (req, res) => {
    try {
        const data = await userService.uploadProfilePicture(req.user.id, req.file);
        handleResponse(res, data, message.USER_UPDATE);
    } catch (error) {
        handleError(res, error, 'updateUserProfilePicture');
    }
};

module.exports = {
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    updateUserProfilePicture
};
