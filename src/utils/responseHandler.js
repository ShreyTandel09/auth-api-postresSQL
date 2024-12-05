const httpStatus = require('http-status');
const { sendSuccess, sendError } = require('../helper/response.helper');
const logger = require('./logger');

const handleResponse = (res, data, successMessage) => {
    if (!data.statusCode) {
        sendSuccess(res, data, successMessage, httpStatus.OK);
    } else {
        sendError(res, data.message, data.statusCode);
    }
};

const handleError = (res, error, serviceName) => {
    logger.error(`Error in ${serviceName}:`, error);
    sendError(res, 'Something went wrong', httpStatus.INTERNAL_SERVER_ERROR);
};

module.exports = {
    handleResponse,
    handleError
}; 