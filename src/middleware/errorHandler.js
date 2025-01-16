const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const errorHandler = async (err, req, res, next) => {
    // Log the error using the logError helper
    await logger.logError(err, req);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Handle unexpected errors
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal Server Error'
    });
};

module.exports = errorHandler;