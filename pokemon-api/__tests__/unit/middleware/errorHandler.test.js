const httpStatus = require('http-status-codes');
const errorHandler = require('../../../middleware/errorHandler');
const logger = require('../../../utils/logger');

// Mock logger to prevent actual logging during tests
jest.mock('../../../utils/logger', () => ({
    error: jest.fn()
}));

describe('Error Handler Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            method: 'GET',
            originalUrl: '/api/pokemon',
            headers: { 'content-type': 'application/json' }
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        mockNext = jest.fn();

        // Clear logger mock between tests
        logger.error.mockClear();
    });

    it('should log the error', () => {
        const testError = new Error('Test error');
        errorHandler(testError, mockReq, mockRes, mockNext);
        expect(logger.error).toHaveBeenCalledWith(testError.stack || testError.message);
    });

    describe('API Errors', () => {
        it('should handle 404 Not Found errors', () => {
            const apiError = new Error('Pokémon not found');
            apiError.response = { status: httpStatus.NOT_FOUND };

            errorHandler(apiError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.NOT_FOUND);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Not Found',
                message: 'Pokémon not found'
            });
        });

        it('should handle 422 Unprocessable Entity with details', () => {
            const validationError = new Error('Validation failed');
            validationError.response = {
                status: httpStatus.UNPROCESSABLE_ENTITY,
                data: { errors: ['Invalid type', 'Missing name'] }
            };

            errorHandler(validationError, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Unprocessable Entity',
                message: 'Validation failed',
                details: ['Invalid type', 'Missing name']
            });
        });
    });

    describe('Validation Errors', () => {
        it('should handle Joi validation errors', () => {
            const joiError = new Error('Validation error');
            joiError.isJoi = true;
            joiError.details = [{ message: 'Name is required' }];

            errorHandler(joiError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                details: [{ message: 'Name is required' }]
            });
        });

        it('should handle express-validator errors', () => {
            const validatorError = new Error('Validation error');
            validatorError.errors = [
                { msg: 'Invalid email', param: 'email' }
            ];

            errorHandler(validatorError, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                details: [{ msg: 'Invalid email', param: 'email' }]
            });
        });
    });

    describe('Custom Application Errors', () => {
        it('should handle custom errors with status codes', () => {
            const customError = new Error('Custom error');
            customError.isCustomError = true;
            customError.statusCode = httpStatus.FORBIDDEN;
            customError.name = 'ForbiddenError';

            errorHandler(customError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.FORBIDDEN);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'ForbiddenError',
                message: 'Custom error'
            });
        });
    });

    describe('Generic Errors', () => {
        it('should return 500 for unexpected errors in production', () => {
            process.env.NODE_ENV = 'production';
            const unexpectedError = new Error('Database connection failed');

            errorHandler(unexpectedError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(
                httpStatus.INTERNAL_SERVER_ERROR
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: 'Something went wrong'
            });
        });

        it('should include error message in development', () => {
            process.env.NODE_ENV = 'development';
            const unexpectedError = new Error('Database connection failed');

            errorHandler(unexpectedError, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: 'Database connection failed'
            });
        });
    });
    describe('API Errors', () => {
        it('should use INTERNAL_SERVER_ERROR if status is missing', () => {
            const apiError = new Error('Unknown error');
            apiError.response = {}; // no status
            errorHandler(apiError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: httpStatus.getStatusText(httpStatus.INTERNAL_SERVER_ERROR),
                message: 'Unknown error',
                details: undefined
            });
        });

        it('should set details to undefined if not 422', () => {
            const apiError = new Error('Some error');
            apiError.response = { status: httpStatus.BAD_REQUEST, data: { errors: ['foo'] } };
            errorHandler(apiError, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                error: httpStatus.getStatusText(httpStatus.BAD_REQUEST),
                message: 'Some error',
                details: undefined
            });
        });

        it('should set details to errors array if 422', () => {
            const apiError = new Error('Validation failed');
            apiError.response = {
                status: httpStatus.UNPROCESSABLE_ENTITY,
                data: { errors: ['err1', 'err2'] }
            };
            errorHandler(apiError, mockReq, mockRes, mockNext);

            expect(mockRes.json).toHaveBeenCalledWith({
                error: httpStatus.getStatusText(httpStatus.UNPROCESSABLE_ENTITY),
                message: 'Validation failed',
                details: ['err1', 'err2']
            });
        });
    });

    describe('Validation Errors', () => {
        it('should handle when both details and errors are undefined', () => {
            const valError = new Error('Validation error');
            valError.isJoi = true;
            delete valError.details;
            delete valError.errors;

            errorHandler(valError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.BAD_REQUEST);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Validation Error',
                details: undefined
            });
        });
    });

    describe('Custom Application Errors', () => {
        it('should handle missing statusCode gracefully', () => {
            const customError = new Error('Custom error');
            customError.isCustomError = true;
            customError.name = 'CustomError';
            // statusCode missing

            errorHandler(customError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(undefined);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'CustomError',
                message: 'Custom error'
            });
        });
    });

    describe('Default Error Handler', () => {
        it('should handle missing NODE_ENV', () => {
            delete process.env.NODE_ENV;
            const error = new Error('Some error');
            errorHandler(error, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(httpStatus.INTERNAL_SERVER_ERROR);
            expect(mockRes.json).toHaveBeenCalledWith({
                error: 'Internal Server Error',
                message: 'Something went wrong'
            });
        });
    });
});