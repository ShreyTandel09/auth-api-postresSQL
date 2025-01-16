// utils/ApiError.js

const httpStatus = require('http-status');

class ApiError extends Error {
    constructor(statusCode, message, isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }

    // Static method to create a new instance easily
    static badRequest(message) {
        return new ApiError(httpStatus.BAD_REQUEST, message);
    }

    static notFound(message) {
        return new ApiError(httpStatus.NOT_FOUND, message);
    }

    static internalError(message) {
        return new ApiError(httpStatus.INTERNAL_SERVER_ERROR, message, false);
    }

    static unauthorized(message) {
        return new ApiError(httpStatus.UNAUTHORIZED, message);
    }

    static forbidden(message) {
        return new ApiError(httpStatus.FORBIDDEN, message);
    }
}

module.exports = ApiError;
