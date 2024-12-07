const httpStatus = require('http-status');
const logger = require('./logger');

// Response Types
const ResponseType = {
    SUCCESS: 'success',
    ERROR: 'error'
};

// Standard HTTP Response Creator
const createApiResponse = (type, message, statusCode, data = null) => {
    const response = {
        success: type === ResponseType.SUCCESS,
        message,
        statusCode
    };

    if (data) {
        response.data = data;
    }

    return response;
};

// Success Response Helper
const createSuccessResponse = (data = null, statusCode = httpStatus.OK) => {
    return createApiResponse(ResponseType.SUCCESS, 'Operation successful', statusCode, data);
};

// Error Response Helper
const createErrorResponse = (message = 'Internal Server Error', statusCode = httpStatus.INTERNAL_SERVER_ERROR) => {
    return createApiResponse(ResponseType.ERROR, message, statusCode);
};

// Service Error Handler
const handleServiceError = (error, serviceName) => {
    logger.error(`Error in ${serviceName} service:`, {
        message: error.message,
        stack: error.stack,
        serviceName
    });
    return createErrorResponse();
};

// Not Found Response Helper
const createNotFoundResponse = (entity = 'Resource') => {
    return createErrorResponse(`${entity} not found`, httpStatus.NOT_FOUND);
};

// Bad Request Response Helper
const createBadRequestResponse = (message) => {
    return createErrorResponse(message, httpStatus.BAD_REQUEST);
};

// Unauthorized Response Helper
const createUnauthorizedResponse = (message = 'Unauthorized access') => {
    return createErrorResponse(message, httpStatus.UNAUTHORIZED);
};

// Forbidden Response Helper
const createForbiddenResponse = (message = 'Access forbidden') => {
    return createErrorResponse(message, httpStatus.FORBIDDEN);
};

// Validation Error Response Helper
const createValidationErrorResponse = (errors) => {
    return createErrorResponse('Validation failed', httpStatus.BAD_REQUEST, { errors });
};

// Conflict Response Helper
const createConflictResponse = (message) => {
    return createErrorResponse(message, httpStatus.CONFLICT);
};

module.exports = {
    ResponseType,
    createApiResponse,
    createSuccessResponse,
    createErrorResponse,
    handleServiceError,
    createNotFoundResponse,
    createBadRequestResponse,
    createUnauthorizedResponse,
    createForbiddenResponse,
    createValidationErrorResponse,
    createConflictResponse
};