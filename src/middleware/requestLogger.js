const winston = require('winston');
const { format } = winston;
const path = require('path');
const configureLogRotation = require('../utils/logRotation');

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Custom format for request logging
const requestFormat = format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
});

// Create request logger
const requestLogger = winston.createLogger({
    format: format.combine(
        format.timestamp(),
        format.json(),
        requestFormat
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'requests.log'),
            level: 'info'
        }),
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error'
        })
    ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
    requestLogger.add(new winston.transports.Console({
        format: format.combine(
            format.colorize(),
            format.simple()
        )
    }));
}

// Configure log rotation
configureLogRotation(requestLogger);

const logRequest = (req, res, next) => {
    const start = Date.now();

    // Log request
    const logInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
        query: Object.keys(req.query).length ? req.query : undefined,
        headers: sanitizeHeaders(req.headers)
    };

    // Log response when finished
    res.on('finish', () => {
        logInfo.statusCode = res.statusCode;
        logInfo.responseTime = `${Date.now() - start}ms`;

        const logMessage = JSON.stringify(logInfo);

        if (res.statusCode >= 400) {
            requestLogger.error(logMessage);
        } else {
            requestLogger.info(logMessage);
        }
    });

    next();
};

// Sanitize sensitive data from request body
const sanitizeRequestBody = (body) => {
    if (!body) return undefined;

    const sanitized = { ...body };
    const sensitiveFields = ['password', 'confirm_password', 'token', 'refreshToken', 'credit_card'];

    sensitiveFields.forEach(field => {
        if (field in sanitized) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Sanitize sensitive headers
const sanitizeHeaders = (headers) => {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];

    sensitiveHeaders.forEach(header => {
        if (header in sanitized) {
            sanitized[header] = '[REDACTED]';
        }
    });

    return sanitized;
};

module.exports = logRequest; 