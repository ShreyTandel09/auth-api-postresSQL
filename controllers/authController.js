
const httpStatus = require('http-status');

const authService = require('../services/auth.service')
const message = require('../utils/responseMessage')
const { sendSuccess, sendError } = require('../helper/response.helper');
const ApiError = require('../utils/ApiError');


const register = async (req, res) => {
    try {
        const data = await authService.registerUser(req.body);

        if (!data.statusCode) {
            sendSuccess(res, data, message.USER_REGISTER, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }

    } catch (error) {
        console.error("Unexpected error:", error);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
};


const verifyEmail = async (req, res) => {

    try {
        const data = await authService.verifyUser(req.query);
        if (!data.statusCode) {
            sendSuccess(res, data, message.EMAIL_VERIFIED, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }
    } catch (err) {
        console.error(err.message);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
}


const resendVerifyEmail = async (req, res) => {

    try {
        const data = await authService.resendVerifyUserEmail(req.body);
        if (!data.statusCode) {
            sendSuccess(res, data, message.VERIFY_EMAIL, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }
    } catch (err) {
        console.error(err.message);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
}


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.loginUser(email, password);
        if (!data.statusCode) {
            const { user, token, refreshToken } = data;
            sendSuccess(res, { user, token, refreshToken }, message.USER_LOGGED_IN, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }
    } catch (error) {
        console.error("Unexpected error:", error);
        sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR)
    }
};


const refreshToken = async (req, res) => {

    try {
        const data = await authService.refreshTokenService(req.body);
        if (!data.statusCode) {
            const { user, token, refreshToken } = data;
            sendSuccess(res, { user, token, refreshToken }, message.TOKEN_GENERATED, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }

};

const forgotPassword = async (req, res) => {
    try {
        const data = await authService.forgotPasswordService(req.body);
        if (!data.statusCode) {
            sendSuccess(res, data, message.PASSWORD_REST_LINK_SENT, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }

}

const resetPassword = async (req, res) => {
    try {
        const data = await authService.resetPasswordService(req);
        if (!data.statusCode) {
            sendSuccess(res, data, message.PASSWORD_SET_SUCCESS, httpStatus.OK);
        } else {
            sendError(res, data.message, data.statusCode);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Server error' });
    }
}


module.exports = {
    register,
    login,
    verifyEmail,
    resendVerifyEmail,
    refreshToken,
    forgotPassword,
    resetPassword
};
