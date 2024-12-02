// logger.js
const winston = require('winston');

// Define custom format for logs
const customFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
            timestamp,
            level,
            message,
            ...meta
        });
    })
);

// Create Winston logger
const logger = winston.createLogger({
    format: customFormat,
    transports: [
        // Error logs
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        // Request logs
        new winston.transports.File({
            filename: 'logs/request.log',
            level: 'info'
        })
    ],
    // Prevent winston from exiting on error
    exitOnError: false
});

// Sanitize sensitive data from request body
const sanitizeBody = (body) => {
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'confirm_password', 'token', 'refreshToken'];

    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '********';
        }
    });

    return sanitized;
};

// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            // Add request body (sanitized)
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
            // Add query parameters if present
            query: Object.keys(req.query).length ? req.query : undefined,
            // Add route parameters if present
            params: Object.keys(req.params).length ? req.params : undefined
        };

        // Log requests based on status code
        if (res.statusCode >= 400) {
            logger.error('Request failed', logData);
        } else {
            logger.info('Request completed', logData);
        }
    });

    next();
};

// Error logging helper
const logError = (error, context = '') => {
    logger.error(`${context}:`, {
        message: error.message,
        stack: error.stack,
        ...(error.statusCode && { statusCode: error.statusCode }),
        ...(error.code && { code: error.code })
    });
};

module.exports = { logger, requestLogger, logError };
