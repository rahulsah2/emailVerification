console.log('Loading errorHandler.js');
const { errorResponse } = require('../../../utils/response.js');
const { STATUS_CODES } = require('../../../constants/statusCodes.js');
const logger = require('../../../utils/logger.js');

const errorHandler = (err, req, res, next) => {
  // Log the error using winston
  logger.error(`${err.name}: ${err.message}\nStack: ${err.stack}`);

  // Handle AppError instances (from validation.middleware.js and authService.js)
  if (err.name === 'AppError') {
    return errorResponse(res, err.statusCode, err.message);
  }

  // Handle Joi validation errors (from validation.middleware.js)
  if (err.isJoi) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, `Validation error: ${err.message}`);
  }

  // Handle MongoDB validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'Invalid input data');
  }

  // Handle MongoDB duplicate key errors
  if (err.name === 'MongoError' && err.code === 11000) {
    return errorResponse(res, STATUS_CODES.BAD_REQUEST, 'Duplicate key error');
  }

  // Default to internal server error
  return errorResponse(
    res,
    STATUS_CODES.INTERNAL_SERVER_ERROR,
    'Something went wrong!'
  );
};

module.exports = errorHandler;