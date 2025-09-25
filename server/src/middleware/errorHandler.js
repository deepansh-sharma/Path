/**
 * @fileoverview Comprehensive error handling middleware
 * @description Centralized error handling system with meaningful messages and consistent response structure
 * @version 1.0.0
 * @author Pathology SaaS Team
 */

/**
 * Custom error class for application-specific errors
 * @class AppError
 * @extends Error
 */
export class AppError extends Error {
  constructor(message, statusCode, code = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create standardized error response object
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @returns {Object} Standardized error response
 */
const createErrorResponse = (error, req) => {
  const response = {
    success: false,
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  };

  // Add error code if available
  if (error.code) {
    response.code = error.code;
  }

  // Add details for validation errors or other structured errors
  if (error.details) {
    response.details = error.details;
  }

  // Add request ID for tracking (if available)
  if (req.id) {
    response.requestId = req.id;
  }

  // Add lab context if available
  if (req.user?.labId) {
    response.labId = req.user.labId;
  }

  return response;
};

/**
 * Handle MongoDB duplicate key errors
 * @param {Error} error - MongoDB duplicate key error
 * @returns {AppError} Formatted application error
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyPattern)[0];
  const value = error.keyValue[field];
  
  const fieldMessages = {
    email: 'Email address already exists',
    phone: 'Phone number already exists',
    patientId: 'Patient ID already exists',
    sampleBarcode: 'Sample barcode already exists',
    invoiceId: 'Invoice ID already exists'
  };

  const message = fieldMessages[field] || `${field} already exists`;
  
  return new AppError(
    message,
    409,
    'DUPLICATE_KEY_ERROR',
    {
      field,
      value,
      constraint: 'unique'
    }
  );
};

/**
 * Handle MongoDB validation errors
 * @param {Error} error - MongoDB validation error
 * @returns {AppError} Formatted application error
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value,
    kind: err.kind
  }));

  return new AppError(
    'Data validation failed',
    400,
    'VALIDATION_ERROR',
    { errors }
  );
};

/**
 * Handle MongoDB cast errors (invalid ObjectId, etc.)
 * @param {Error} error - MongoDB cast error
 * @returns {AppError} Formatted application error
 */
const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  
  return new AppError(
    message,
    400,
    'INVALID_DATA_FORMAT',
    {
      field: error.path,
      value: error.value,
      expectedType: error.kind
    }
  );
};

/**
 * Handle JWT authentication errors
 * @param {Error} error - JWT error
 * @returns {AppError} Formatted application error
 */
const handleJWTError = (error) => {
  const jwtErrors = {
    'JsonWebTokenError': 'Invalid authentication token',
    'TokenExpiredError': 'Authentication token has expired',
    'NotBeforeError': 'Authentication token not active yet'
  };

  const message = jwtErrors[error.name] || 'Authentication failed';
  
  return new AppError(
    message,
    401,
    'AUTHENTICATION_ERROR',
    { reason: error.name }
  );
};

/**
 * Handle express-validator errors
 * @param {Array} errors - Array of validation errors
 * @returns {AppError} Formatted application error
 */
export const handleValidatorErrors = (errors) => {
  const formattedErrors = errors.map(error => ({
    field: error.path || error.param,
    message: error.msg,
    value: error.value,
    location: error.location
  }));

  return new AppError(
    'Request validation failed',
    400,
    'REQUEST_VALIDATION_ERROR',
    { errors: formattedErrors }
  );
};

/**
 * Development error response with full error details
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (error, req, res) => {
  const response = createErrorResponse(error, req);
  
  // Add development-specific details
  response.error = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    ...error
  };

  console.error('🚨 ERROR DETAILS:', {
    timestamp: response.timestamp,
    path: response.path,
    method: response.method,
    statusCode: error.statusCode,
    name: error.name,
    message: error.message,
    stack: error.stack,
    user: req.user?.email || 'anonymous',
    labId: req.user?.labId || 'unknown'
  });

  res.status(error.statusCode || 500).json(response);
};

/**
 * Production error response with minimal error exposure
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (error, req, res) => {
  const response = createErrorResponse(error, req);

  // Only send operational errors to client in production
  if (error.isOperational) {
    // Log error for monitoring
    console.error('🚨 OPERATIONAL ERROR:', {
      timestamp: response.timestamp,
      path: response.path,
      method: response.method,
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
      user: req.user?.email || 'anonymous',
      labId: req.user?.labId || 'unknown'
    });

    res.status(error.statusCode).json(response);
  } else {
    // Log programming errors for debugging
    console.error('🚨 PROGRAMMING ERROR:', {
      timestamp: response.timestamp,
      path: response.path,
      method: response.method,
      name: error.name,
      message: error.message,
      stack: error.stack,
      user: req.user?.email || 'anonymous',
      labId: req.user?.labId || 'unknown'
    });

    // Send generic error message
    response.message = 'Something went wrong. Please try again later.';
    response.code = 'INTERNAL_SERVER_ERROR';
    delete response.details;

    res.status(500).json(response);
  }
};

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const globalErrorHandler = (err, req, res, next) => {
  // Set default error properties
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };
  error.message = err.message;

  // Handle specific error types
  if (err.code === 11000) {
    error = handleDuplicateKeyError(err);
  } else if (err.name === 'ValidationError') {
    error = handleValidationError(err);
  } else if (err.name === 'CastError') {
    error = handleCastError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
    error = handleJWTError(err);
  }

  // Send error response based on environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, req, res);
  } else {
    sendErrorProd(error, req, res);
  }
};

/**
 * Handle unhandled promise rejections
 * @param {Error} err - Unhandled rejection error
 */
export const handleUnhandledRejection = (err) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Graceful shutdown
  process.exit(1);
};

/**
 * Handle uncaught exceptions
 * @param {Error} err - Uncaught exception error
 */
export const handleUncaughtException = (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Graceful shutdown
  process.exit(1);
};

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped function with error handling
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const handleNotFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    'ROUTE_NOT_FOUND',
    {
      path: req.originalUrl,
      method: req.method,
      availableRoutes: [
        'GET /api/patients',
        'POST /api/patients/register',
        'GET /api/patients/:id',
        'PUT /api/patients/:id',
        'DELETE /api/patients/:id'
      ]
    }
  );

  next(error);
};

export default {
  AppError,
  globalErrorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  catchAsync,
  handleNotFound,
  handleValidatorErrors
};