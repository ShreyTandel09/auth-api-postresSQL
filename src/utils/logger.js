const winston = require('winston');
const { format } = winston;
const util = require('util');
const db = require('../models');

// Safely stringify objects with circular references
const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj);
    } catch (err) {
        return util.inspect(obj, { depth: 2, maxArrayLength: 10 });
    }
};

// Sanitize sensitive data
const sanitizeData = (data) => {
    if (!data) return undefined;

    const sanitized = { ...data };
    const sensitiveFields = ['password', 'token', 'refreshToken', 'authorization'];

    Object.keys(sanitized).forEach(key => {
        if (sensitiveFields.includes(key.toLowerCase())) {
            sanitized[key] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Custom database transport
class DatabaseTransport extends winston.Transport {
    async log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        try {
            if (!db.Log) {
                console.error('Log model is not properly initialized');
                return callback();
            }

            const message = info.message;

            // Handle different types of log messages
            if (typeof message === 'string') {
                // Simple message logging
                await db.Log.create({
                    type: 'SYSTEM',
                    method: 'SYSTEM',
                    endpoint: 'SYSTEM',
                    statusCode: 0,
                    responseTime: 0,
                    ip: 'system',
                    requestBody: { message }
                });
            } else if (message.type === 'API_REQUEST' || message.type === 'API_ERROR') {
                // API request/error logging
                await db.Log.create({
                    type: message.type,
                    method: message.endpoint?.method || 'UNKNOWN',
                    endpoint: message.endpoint?.path || 'UNKNOWN',
                    statusCode: message.response?.statusCode || 500,
                    responseTime: parseInt(message.response?.responseTime) || 0,
                    ip: message.client?.ip || 'unknown',
                    userAgent: message.client?.userAgent,
                    userId: message.user?.id,
                    requestBody: message.request?.body,
                    requestQuery: message.request?.query,
                    responseBody: message.response?.body,
                    error: message.type === 'API_ERROR' ? {
                        message: message.error?.message,
                        name: message.error?.name,
                        code: message.error?.code,
                        stack: process.env.NODE_ENV === 'development' ? message.error?.stack : undefined
                    } : null
                });
            }
        } catch (error) {
            console.error('Error saving log to database:', error);
        }

        callback();
    }
}

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    defaultMeta: { service: 'api-service' },
    transports: [
        new DatabaseTransport(),
        ...(process.env.NODE_ENV !== 'production' ? [
            new winston.transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.simple()
                )
            })
        ] : [])
    ]
});

// Helper methods for consistent logging
logger.logRequest = async (req, res, responseTime) => {
    const logData = {
        type: 'API_REQUEST',
        endpoint: {
            method: req.method,
            path: req.originalUrl,
            route: req.route?.path
        },
        request: {
            headers: sanitizeData(req.headers),
            query: req.query,
            body: req.method !== 'GET' ? sanitizeData(req.body) : undefined
        },
        response: {
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            responseTime: `${responseTime}ms`,
            body: sanitizeData(req.responseBody)
        },
        client: {
            ip: req.ip,
            userAgent: req.get('user-agent')
        },
        user: req.user?.id ? {
            id: req.user.id,
            email: req.user.email
        } : undefined
    };

    await logger.info({ message: logData });
};

logger.logError = async (error, req) => {
    const logData = {
        type: 'API_ERROR',
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        },
        endpoint: {
            method: req?.method,
            path: req?.originalUrl,
            route: req?.route?.path
        },
        client: req ? {
            ip: req.ip,
            userAgent: req.get('user-agent')
        } : undefined,
        user: req?.user?.id ? {
            id: req.user.id,
            email: req.user.email
        } : undefined
    };

    await logger.error({ message: logData });
};

module.exports = logger;
