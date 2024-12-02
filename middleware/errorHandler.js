const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message
        });
    }

    // Log unexpected errors
    logger.error(err);

    return res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
}; 