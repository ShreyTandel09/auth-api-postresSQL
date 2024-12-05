const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const responseTime = Date.now() - start;
        logger.logRequest(req, res, responseTime);
    });

    next();
};

module.exports = requestLogger; 