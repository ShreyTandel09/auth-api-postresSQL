const httpStatus = require('http-status');
const authService = require('../services/auth.service');
const message = require('../utils/responseMessage');
const { handleResponse, handleError } = require('../utils/responseHandler');

const register = async (req, res) => {
    try {
        const data = await authService.registerUser(req.body);
        handleResponse(res, data, message.USER_REGISTER);
    } catch (error) {
        handleError(res, error, 'register');
    }
};

const verifyEmail = async (req, res) => {
    try {
        const data = await authService.verifyUser(req.query);
        handleResponse(res, data, message.EMAIL_VERIFIED);
    } catch (error) {
        handleError(res, error, 'verifyEmail');
    }
};

const resendVerifyEmail = async (req, res) => {
    try {
        const data = await authService.resendVerifyUserEmail(req.body);
        handleResponse(res, data, message.VERIFY_EMAIL);
    } catch (error) {
        handleError(res, error, 'resendVerifyEmail');
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const data = await authService.loginUser(email, password);
        console.log("data", data);

        handleResponse(res, data, message.USER_LOGGED_IN);
    } catch (error) {
        handleError(res, error, 'login');
    }
};

const refreshToken = async (req, res) => {
    try {
        const data = await authService.refreshTokenService(req.body);
        handleResponse(res, data, message.TOKEN_GENERATED);
    } catch (error) {
        handleError(res, error, 'refreshToken');
    }
};

const forgotPassword = async (req, res) => {
    try {
        const data = await authService.forgotPasswordService(req.body);
        handleResponse(res, data, message.PASSWORD_REST_LINK_SENT);
    } catch (error) {
        handleError(res, error, 'forgotPassword');
    }
};

const resetPassword = async (req, res) => {
    try {
        const data = await authService.resetPasswordService({
            query: req.query,
            body: req.body
        });
        handleResponse(res, data, message.PASSWORD_RESET_SUCCESS);
    } catch (error) {
        handleError(res, error, 'resetPassword');
    }
};

module.exports = {
    register,
    verifyEmail,
    resendVerifyEmail,
    login,
    refreshToken,
    forgotPassword,
    resetPassword
};