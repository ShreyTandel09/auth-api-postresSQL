const winston = require('winston');
const { format } = winston;
const util = require('util');

// Sanitize sensitive data from request body
const sanitizeBody = (body) => {
    if (!body) return undefined;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'refreshToken', 'credit_card', 'ssn'];

    sensitiveFields.forEach(field => {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Safely stringify objects with circular references
const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj);
    } catch (err) {
        return util.inspect(obj, { depth: 2, maxArrayLength: 10 });
    }
};

// Custom format for request logging
const requestFormat = format((info) => {
    if (info.req) {
        const { req, res, responseTime } = info;

        info.message = {
            method: req.method,
            path: req.path,
            status: res?.statusCode,
            duration: `${responseTime}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            body: req.method !== 'GET' ? sanitizeBody(req.body) : undefined,
            query: Object.keys(req.query).length ? req.query : undefined,
        };

        // Ensure no circular references are included in logs
        info.message = safeStringify(info.message);

        delete info.req;
        delete info.res;
        delete info.responseTime;
    }
    return info;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        requestFormat(),
        format.json()
    ),
    defaultMeta: { service: 'api-service' },
    transports: [
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        })
    ]
});

// Development logging
// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: format.combine(
//             format.colorize(),
//             format.simple(),
//             format.printf(({ level, message, timestamp, stack }) => {
//                 if (typeof message === 'object') {
//                     message = safeStringify(message);
//                 }
//                 if (stack) {
//                     return `${timestamp} ${level}: ${message}\n${stack}`;
//                 }
//                 return `${timestamp} ${level}: ${message}`;
//             })
//         )
//     }));
// }

// Helper methods for consistent logging
logger.logRequest = (req, res, responseTime) => {
    logger.info({ req, res, responseTime });
};

logger.logError = (error, req) => {
    logger.error({
        message: error.message,
        stack: error.stack,
        path: req?.path,
        method: req?.method,
        body: req?.method !== 'GET' ? sanitizeBody(req?.body) : undefined
    });
};

module.exports = logger;
