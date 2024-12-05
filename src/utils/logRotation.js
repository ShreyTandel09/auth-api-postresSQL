const fs = require('fs');
const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const logsDir = path.join(__dirname, '../logs');

// Create transport for daily rotate file
const createDailyRotateTransport = (filename, level) => {
    return new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, `${filename}-%DATE%.log`),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level
    });
};

// Configure log rotation
const configureLogRotation = (logger) => {
    // Remove existing file transports
    logger.transports.forEach(t => {
        if (t instanceof winston.transports.File) {
            logger.remove(t);
        }
    });

    // Add daily rotate transports
    logger.add(createDailyRotateTransport('requests', 'info'));
    logger.add(createDailyRotateTransport('errors', 'error'));
};

module.exports = configureLogRotation; 