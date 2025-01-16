const logger = require('../utils/logger');

const logRequest = async (req, res, next) => {
    const startTime = Date.now();
    let responseBody;

    // Capture the original send function
    const originalSend = res.send;
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    // Capture the original json function
    const originalJson = res.json;
    res.json = function (body) {
        responseBody = body;
        return originalJson.apply(res, arguments);
    };

    res.on('finish', async () => {
        const responseTime = Date.now() - startTime;

        // Parse response body if it's a string (likely JSON)
        if (typeof responseBody === 'string') {
            try {
                responseBody = JSON.parse(responseBody);
            } catch (e) {
                // If parsing fails, keep original string
            }
        }

        // Add response body to the request object for logging
        req.responseBody = responseBody;

        await logger.logRequest(req, res, responseTime);
    });

    next();
};

module.exports = logRequest; 