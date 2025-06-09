const path = require('path');

const mockFormat = jest.fn((fn) => fn); // Make format callable as a function
mockFormat.combine = jest.fn();
mockFormat.timestamp = jest.fn();
mockFormat.printf = jest.fn((fn) => fn);
mockFormat.colorize = jest.fn();
mockFormat.errors = jest.fn();

jest.mock('winston', () => {
    const mockTransport = {
        Console: jest.fn(),
        File: jest.fn()
    };

    return {
        format: mockFormat,
        transports: mockTransport,
        createLogger: jest.fn(() => ({
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            warn: jest.fn(),
            exceptions: {
                handle: jest.fn()
            }
        }))
    };
});

const winston = require('winston');
const logger = require('../../../utils/logger');

describe('Logger Utility', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getLogger', () => {
        it('should create a logger with correct configuration', () => {
            const mockModule = { filename: path.join(__dirname, 'test.js') };
            logger.getLogger(mockModule);

            expect(winston.createLogger).toHaveBeenCalled();
            expect(winston.transports.Console).toHaveBeenCalled();
            expect(winston.transports.File).toHaveBeenCalledTimes(3);
        });

        it('should use production format when NODE_ENV=production', () => {
            process.env.NODE_ENV = 'production';
            jest.resetModules();
            const logger = require('../../../utils/logger');

            const mockModule = { filename: path.join(__dirname, 'test.js') };
            logger.getLogger(mockModule);

            expect(winston.format.printf).toHaveBeenCalledWith(expect.any(Function));
            process.env.NODE_ENV = 'test';
        });
    });

    describe('Singleton Logger', () => {
        it('should have standard logging methods', () => {
            expect(typeof logger.info).toBe('function');
            expect(typeof logger.error).toBe('function');
            expect(typeof logger.debug).toBe('function');
            expect(typeof logger.warn).toBe('function');
        });

        it('should handle error logging with stack traces', () => {
            const error = new Error('Test error');
            logger.error(error);

            expect(logger.error).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Test error',
                    stack: expect.stringContaining('Error: Test error')
                })
            );
        });

        it('should handle string messages', () => {
            logger.info('Test message');

            expect(logger.info).toHaveBeenCalledWith('Test message');
        });
    });

    describe('Exception Handling', () => {
        it('should configure exception handling', () => {
            logger.getLogger();
            const loggerInstance = winston.createLogger.mock.results[0].value;
            expect(loggerInstance.exceptions.handle).toHaveBeenCalled();
        });
    });

    describe('Logger Utility', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should set log level to "debug" when NODE_ENV is not production', () => {
            process.env.NODE_ENV = 'development';
            const mockModule = { filename: '/foo/bar.js' };
            logger.getLogger(mockModule);
            expect(winston.createLogger).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 'debug'
                })
            );
        });

        it('should set log level to "info" when NODE_ENV is production', () => {
            process.env.NODE_ENV = 'production';
            const mockModule = { filename: '/foo/bar.js' };
            logger.getLogger(mockModule);
            expect(winston.createLogger).toHaveBeenCalledWith(
                expect.objectContaining({
                    level: 'info'
                })
            );
            process.env.NODE_ENV = 'test';
        });

        it('should set defaultMeta.file to module filename', () => {
            const mockModule = { filename: '/foo/bar.js' };
            logger.getLogger(mockModule);
            expect(winston.createLogger).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultMeta: expect.objectContaining({
                        file: 'bar.js'
                    })
                })
            );
        });

        it('should set defaultMeta.file to "app" if no module is provided', () => {
            logger.getLogger();
            expect(winston.createLogger).toHaveBeenCalledWith(
                expect.objectContaining({
                    defaultMeta: expect.objectContaining({
                        file: 'app'
                    })
                })
            );
        });

        it('should configure three transports: Console, File (error), File (combined), plus exceptions', () => {
            logger.getLogger();
            expect(winston.transports.Console).toHaveBeenCalled();
            expect(winston.transports.File).toHaveBeenCalledTimes(3); // <-- FIXED
        });

        it('should use colorize in development mode', () => {
            process.env.NODE_ENV = 'development';
            logger.getLogger();
            expect(winston.format.colorize).toHaveBeenCalled();
        });

        it('should use prodFormat in production mode', () => {
            process.env.NODE_ENV = 'production';
            jest.resetModules();
            const logger = require('../../../utils/logger');
            logger.getLogger();
            expect(winston.format.printf).toHaveBeenCalledWith(expect.any(Function));
            process.env.NODE_ENV = 'test';
        });

        it('should return a logger with info, error, debug, warn methods', () => {
            const log = logger.getLogger();
            expect(typeof log.info).toBe('function');
            expect(typeof log.error).toBe('function');
            expect(typeof log.debug).toBe('function');
            expect(typeof log.warn).toBe('function');
        });

        it('should call exceptions.handle with File transport', () => {
            logger.getLogger();
            const loggerInstance = winston.createLogger.mock.results[0].value;
            expect(loggerInstance.exceptions.handle).toHaveBeenCalledWith(
                expect.any(winston.transports.File)
            );
        });
    });

    describe('Logger formatters', () => {
        const { _test } = require('../../../utils/logger');

        it('errorStackFormat should handle Error instance', () => {
            const error = new Error('fail');
            const result = _test.errorStackFormat(error);
            expect(result.stack).toBe(error.stack);
            expect(result.message).toBe(error.message);
        });

        it('errorStackFormat should return info if not Error', () => {
            const info = { foo: 'bar' };
            expect(_test.errorStackFormat(info)).toBe(info);
        });

        it('devFormat should include stack if present', () => {
            const log = _test.devFormat({
                level: 'warn',
                message: 'msg',
                timestamp: '2024-01-01 00:00:00',
                stack: 'STACK'
            });
            expect(log).toContain('STACK');
            expect(log).toContain('msg');
        });

        it('devFormat should not include stack if absent', () => {
            const log = _test.devFormat({
                level: 'info',
                message: 'msg',
                timestamp: '2024-01-01 00:00:00'
            });
            expect(log).not.toContain('STACK');
            expect(log).toContain('msg');
        });

        it('prodFormat should stringify all fields', () => {
            const log = _test.prodFormat({
                level: 'info',
                message: 'msg',
                timestamp: '2024-01-01 00:00:00',
                foo: 'bar'
            });
            expect(log).toContain('"level":"info"');
            expect(log).toContain('"foo":"bar"');
        });
    });
});