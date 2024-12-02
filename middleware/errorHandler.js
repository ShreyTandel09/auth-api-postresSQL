const { logger } = require('./logger');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

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