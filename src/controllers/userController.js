const httpStatus = require('http-status');
const userService = require('../services/user.service')
const message = require('../utils/responseMessage')
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendError } = require('../helper/response.helper');


const getUserProfile = async (req, res, next) => {
    try {
        const data = await userService.getCurrentUser(req);
        sendSuccess(res, data, message.USER_PROFILE_FETCH, httpStatus.OK);
    } catch (error) {
        next(error);
    }
};


const getAllUsers = async (req, res, next) => {
    try {
        const data = await userService.getAllUsers();
        sendSuccess(res, data, message.USER_ALL, httpStatus.OK);
    } catch (error) {
        next(error);
    }
}

const updateUserProfile = async (req, res, next) => {
    try {
        const data = await userService.updateUser(req.user.id, req.body);
        sendSuccess(res, data, message.USER_UPDATE, httpStatus.OK);
    } catch (error) {
        next(error);
    }
}

const updateUserProfilePicture = async (req, res, next) => {
    try {
        const data = await userService.uploadProfilePicture(req.user.id, req.file);
        sendSuccess(res, data, message.USER_UPDATE, httpStatus.OK);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserProfile,
    getAllUsers,
    updateUserProfile,
    updateUserProfilePicture
};
