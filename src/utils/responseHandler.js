const httpStatus = require('http-status');
const logger = require('./logger');

/**
 * Response format types
 * @constant {Object}
 */
const ResponseType = {
    SUCCESS: 'success',
    ERROR: 'error'
};

/**
 * Creates a standardized response object
 * @param {string} type - Response type ('success' or 'error')
 * @param {string} message - Response message
 * @param {Object} [data] - Response data (optional)
 * @returns {Object} Formatted response object
 * @private
 */
const createResponse = (type, message, data = null) => {
    const response = {
        status: type,
        message
    };

    if (data) {
        response.data = data;
    }

    return response;
};

/**
 * Sends a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send in response
 * @param {string} message - Success message
 * @param {number} [statusCode=200] - HTTP status code
 * @returns {Object} Express response
 * @private
 */
const sendSuccess = (res, data, message, statusCode = httpStatus.OK) => {
    const response = createResponse(ResponseType.SUCCESS, message, data);
    return res.status(statusCode).json(response);
};

/**
 * Sends an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @returns {Object} Express response
 * @private
 */
const sendError = (res, message, statusCode = httpStatus.INTERNAL_SERVER_ERROR) => {
    const response = createResponse(ResponseType.ERROR, message);
    return res.status(statusCode).json(response);
};

/**
 * Handles API responses based on result object
 * @param {Object} res - Express response object
 * @param {Object} result - Result object from service
 * @param {boolean} result.success - Indicates if operation was successful
 * @param {Object} [result.data] - Data to be sent in response
 * @param {string} [result.message] - Error message in case of failure
 * @param {number} result.statusCode - HTTP status code
 * @param {string} successMessage - Message to send on success
 * @returns {Object} Express response
 */
const handleResponse = (res, result, successMessage) => {
    if (!result || typeof result !== 'object') {
        logger.error('Invalid result object provided to handleResponse');
        return sendError(res, 'Internal Server Error');
    }

    const { success, data, message, statusCode } = result;

    if (!success) {
        return sendError(res, message || 'Operation failed', statusCode);
    }

    return sendSuccess(res, data, successMessage, statusCode);
};

/**
 * Handles errors in API endpoints
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} source - Source of the error (for logging)
 * @returns {Object} Express response
 */
const handleError = (res, error, source) => {
    logger.error(`Error in ${source}:`, {
        message: error.message,
        stack: error.stack,
        source
    });

    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Internal Server Error';

    return sendError(res, message, statusCode);
};

module.exports = {
    handleResponse,
    handleError,
    // Export status types for testing
    ResponseType
}; 