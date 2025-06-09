const httpStatus = require('http-status-codes');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error for debugging
    logger.error(err.stack || err.message);

    // Handle API errors
    if (err.response) {
        const status = err.response.status || httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
            error: httpStatus.getStatusText(status),
            message: err.message,
            details: status === httpStatus.UNPROCESSABLE_ENTITY
                ? err.response.data.errors
                : undefined
        });
    }

    // Handle validation errors (e.g., Joi, express-validator)
    if (err.isJoi || Array.isArray(err.errors)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            error: 'Validation Error',
            details: err.details || err.errors
        });
    }

    // Handle custom application errors
    if (err.isCustomError) {
        return res.status(err.statusCode).json({
            error: err.name,
            message: err.message
        });
    }

    // Default error handler
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Internal Server Error',
        message: err.message
    });
};

module.exports = errorHandler;