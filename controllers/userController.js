
const httpStatus = require('http-status');
const userService = require('../services/user.service')
const message = require('../utils/responseMessage')
const ApiError = require('../utils/ApiError');
const { sendSuccess, sendError } = require('../helper/response.helper');


const getUserProfile = async (req, res) => {
    try {
        const data = await userService.getCurrentUser(req);

        if (!data.statusCode) {
            sendSuccess(res, data, message.USER_PROFILE_FETCH, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
}


const getAllUsers = async (req, res) => {
    try {
        const data = await userService.getAllUsers();
        sendSuccess(res, data, message.USER_ALL, httpStatus.OK);

    } catch (error) {
        console.error("Unexpected error:", error);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
}

module.exports = {
    getUserProfile,
    getAllUsers
};
