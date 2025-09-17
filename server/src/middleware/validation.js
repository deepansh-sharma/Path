import { validationResult } from 'express-validator';

/**
 * Middleware to validate request data using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Middleware to sanitize request data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const sanitizeRequest = (req, res, next) => {
  // Remove any undefined or null values from request body
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === undefined || req.body[key] === null) {
        delete req.body[key];
      }
      // Trim string values
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

/**
 * Middleware to validate MongoDB ObjectId parameters
 * @param {string} paramName - Name of the parameter to validate
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    if (!objectIdRegex.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
        error: `${paramName} must be a valid MongoDB ObjectId`
      });
    }
    
    next();
  };
};

/**
 * Middleware to validate pagination parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid page parameter',
      error: 'Page must be a positive integer'
    });
  }
  
  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Invalid limit parameter',
      error: 'Limit must be between 1 and 100'
    });
  }
  
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };
  
  next();
};

export default {
  validateRequest,
  sanitizeRequest,
  validateObjectId,
  validatePagination
};