const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;
const path = require('path');

// Custom format that includes error stack traces when available
const errorStackFormat = format(info => {
    if (info instanceof Error) {
        return {
            ...info,
            stack: info.stack,
            message: info.message
        };
    }
    return info;
});

// Development format with colors and human-readable output
const devFormat = printf(({ level, message, timestamp, stack }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (stack) {
        log += `\n${stack}`;
    }
    return log;
});

// Production format with JSON output
const prodFormat = printf(({ level, message, timestamp, ...metadata }) => {
    const log = {
        timestamp,
        level,
        message,
        ...metadata
    };
    return JSON.stringify(log);
});

// Create a base logger configuration
const getLogger = (module) => {
    const isProduction = process.env.NODE_ENV === 'production';
    const filename = module ? path.basename(module.filename) : 'app';

    const logger = createLogger({
        level: isProduction ? 'info' : 'debug',
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            errors({ stack: true }),
            errorStackFormat(),
            isProduction ? prodFormat : devFormat
        ),
        transports: [
            new transports.Console({
                format: isProduction
                    ? prodFormat
                    : combine(colorize(), devFormat)
            }),
            new transports.File({
                filename: 'logs/error.log',
                level: 'error'
            }),
            new transports.File({
                filename: 'logs/combined.log'
            })
        ],
        defaultMeta: { service: 'pokemon-api', file: filename }
    });

    // Handle uncaught exceptions
    logger.exceptions.handle(
        new transports.File({ filename: 'logs/exceptions.log' })
    );

    return logger;
};

// Singleton logger instance
const logger = getLogger();

module.exports = logger;
module.exports.getLogger = getLogger; // For testing and special cases

// Export formatters for unit test coverage
if (process.env.NODE_ENV === 'test') {
    module.exports._test = {
        errorStackFormat,
        devFormat,
        prodFormat
    };
}