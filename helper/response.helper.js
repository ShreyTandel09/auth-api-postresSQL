// responseHelper.js

/**
 * Send a success response with data.
 * @param {Object} res - The response object.
 * @param {Object} data - The data to send.
 * @param {number} [statusCode=200] - The HTTP status code.
 */
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
        status: 'success',
        code: statusCode,
        message,
        data,
    });
}

/**
 * Send an error response.
 * @param {Object} res - The response object.
 * @param {string} message - The error message.
//  * @param {number} [statusCode=500] - The HTTP status code.
 */
function sendError(res, message, statusCode) {
    console.log(statusCode);
    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message,
    });
}

// Export the helper functions
module.exports = {
    sendSuccess,
    sendError,
};
