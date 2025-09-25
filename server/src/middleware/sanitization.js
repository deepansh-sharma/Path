/**
 * @fileoverview Input sanitization middleware for secure data transmission
 * @description Provides comprehensive input sanitization to prevent XSS, injection attacks, and data corruption
 * @version 1.0.0
 * @author Pathology SaaS Team
 */

import validator from 'validator';
import xss from 'xss';
import { AppError } from './errorHandler.js';

/**
 * Sanitize string input to prevent XSS attacks
 * @param {string} input - Input string to sanitize
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
const sanitizeString = (input, options = {}) => {
  if (typeof input !== 'string') return input;
  
  const {
    allowHtml = false,
    maxLength = 1000,
    trim = true,
    escapeHtml = true
  } = options;

  let sanitized = input;

  // Trim whitespace if requested
  if (trim) {
    sanitized = sanitized.trim();
  }

  // Check length limits
  if (sanitized.length > maxLength) {
    throw new AppError(`Input exceeds maximum length of ${maxLength} characters`, 400, 'INPUT_TOO_LONG');
  }

  // Escape HTML entities or allow specific HTML tags
  if (allowHtml) {
    // Use XSS library to allow safe HTML
    sanitized = xss(sanitized, {
      whiteList: {
        p: [],
        br: [],
        strong: [],
        em: [],
        u: [],
        span: ['style'],
        div: ['class']
      },
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style']
    });
  } else if (escapeHtml) {
    sanitized = validator.escape(sanitized);
  }

  return sanitized;
};

/**
 * Sanitize email input
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;
  
  const sanitized = email.toLowerCase().trim();
  
  if (!validator.isEmail(sanitized)) {
    throw new AppError('Invalid email format', 400, 'INVALID_EMAIL');
  }
  
  return validator.normalizeEmail(sanitized);
};

/**
 * Sanitize phone number input
 * @param {string} phone - Phone number to sanitize
 * @returns {string} Sanitized phone number
 */
const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  const sanitized = phone.replace(/\D/g, '');
  
  if (sanitized.length < 10 || sanitized.length > 15) {
    throw new AppError('Phone number must be between 10-15 digits', 400, 'INVALID_PHONE');
  }
  
  return sanitized;
};

/**
 * Sanitize numeric input
 * @param {any} input - Input to sanitize as number
 * @param {Object} options - Sanitization options
 * @returns {number} Sanitized number
 */
const sanitizeNumber = (input, options = {}) => {
  const { min = null, max = null, allowFloat = true } = options;
  
  let num;
  
  if (typeof input === 'string') {
    num = allowFloat ? parseFloat(input) : parseInt(input, 10);
  } else if (typeof input === 'number') {
    num = input;
  } else {
    throw new AppError('Invalid number format', 400, 'INVALID_NUMBER');
  }
  
  if (isNaN(num)) {
    throw new AppError('Invalid number format', 400, 'INVALID_NUMBER');
  }
  
  if (min !== null && num < min) {
    throw new AppError(`Number must be at least ${min}`, 400, 'NUMBER_TOO_SMALL');
  }
  
  if (max !== null && num > max) {
    throw new AppError(`Number must be at most ${max}`, 400, 'NUMBER_TOO_LARGE');
  }
  
  return num;
};

/**
 * Sanitize MongoDB ObjectId
 * @param {string} id - ID to sanitize
 * @returns {string} Sanitized ID
 */
const sanitizeObjectId = (id) => {
  if (typeof id !== 'string') return id;
  
  const sanitized = id.trim();
  
  if (!validator.isMongoId(sanitized)) {
    throw new AppError('Invalid ID format', 400, 'INVALID_ID');
  }
  
  return sanitized;
};

/**
 * Sanitize date input
 * @param {any} date - Date to sanitize
 * @returns {Date} Sanitized date
 */
const sanitizeDate = (date) => {
  let sanitizedDate;
  
  if (typeof date === 'string') {
    if (!validator.isISO8601(date)) {
      throw new AppError('Invalid date format. Use ISO 8601 format', 400, 'INVALID_DATE');
    }
    sanitizedDate = new Date(date);
  } else if (date instanceof Date) {
    sanitizedDate = date;
  } else {
    throw new AppError('Invalid date format', 400, 'INVALID_DATE');
  }
  
  if (isNaN(sanitizedDate.getTime())) {
    throw new AppError('Invalid date value', 400, 'INVALID_DATE');
  }
  
  return sanitizedDate;
};

/**
 * Recursively sanitize object properties
 * @param {Object} obj - Object to sanitize
 * @param {Object} schema - Sanitization schema
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj, schema) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (schema[key]) {
      const { type, options = {}, required = false } = schema[key];
      
      // Skip undefined values for non-required fields
      if (value === undefined && !required) {
        continue;
      }
      
      // Check required fields
      if (required && (value === undefined || value === null || value === '')) {
        throw new AppError(`Field '${key}' is required`, 400, 'MISSING_REQUIRED_FIELD');
      }
      
      // Apply sanitization based on type
      switch (type) {
        case 'string':
          sanitized[key] = sanitizeString(value, options);
          break;
        case 'email':
          sanitized[key] = sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = sanitizePhone(value);
          break;
        case 'number':
          sanitized[key] = sanitizeNumber(value, options);
          break;
        case 'objectId':
          sanitized[key] = sanitizeObjectId(value);
          break;
        case 'date':
          sanitized[key] = sanitizeDate(value);
          break;
        case 'boolean':
          sanitized[key] = Boolean(value);
          break;
        case 'array':
          if (Array.isArray(value)) {
            sanitized[key] = value.map(item => 
              options.itemSchema ? sanitizeObject(item, options.itemSchema) : item
            );
          } else {
            throw new AppError(`Field '${key}' must be an array`, 400, 'INVALID_ARRAY');
          }
          break;
        case 'object':
          sanitized[key] = options.schema ? sanitizeObject(value, options.schema) : value;
          break;
        default:
          sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Express middleware for request body sanitization
 * @param {Object} schema - Sanitization schema for request body
 * @returns {Function} Express middleware function
 */
export const sanitizeBody = (schema) => {
  return (req, res, next) => {
    try {
      if (req.body && Object.keys(req.body).length > 0) {
        req.body = sanitizeObject(req.body, schema);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Express middleware for query parameters sanitization
 * @param {Object} schema - Sanitization schema for query parameters
 * @returns {Function} Express middleware function
 */
export const sanitizeQuery = (schema) => {
  return (req, res, next) => {
    try {
      if (req.query && Object.keys(req.query).length > 0) {
        req.query = sanitizeObject(req.query, schema);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Express middleware for URL parameters sanitization
 * @param {Object} schema - Sanitization schema for URL parameters
 * @returns {Function} Express middleware function
 */
export const sanitizeParams = (schema) => {
  return (req, res, next) => {
    try {
      if (req.params && Object.keys(req.params).length > 0) {
        req.params = sanitizeObject(req.params, schema);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * General purpose sanitization middleware
 * Sanitizes common request properties
 */
export const generalSanitization = (req, res, next) => {
  try {
    // Sanitize common headers
    if (req.headers['x-tenant-id']) {
      req.headers['x-tenant-id'] = sanitizeString(req.headers['x-tenant-id'], { maxLength: 100 });
    }
    
    // Remove potentially dangerous headers
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-forwarded-server'];
    
    // Sanitize user agent (limit length)
    if (req.headers['user-agent'] && req.headers['user-agent'].length > 500) {
      req.headers['user-agent'] = req.headers['user-agent'].substring(0, 500);
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Patient registration sanitization schema
 */
export const patientRegistrationSchema = {
  name: { type: 'string', required: true, options: { maxLength: 100 } },
  phone: { type: 'phone', required: true },
  email: { type: 'email', required: false },
  age: { type: 'number', required: true, options: { min: 0, max: 150, allowFloat: false } },
  gender: { type: 'string', required: true, options: { maxLength: 20 } },
  dateOfBirth: { type: 'date', required: false },
  bloodGroup: { type: 'string', required: false, options: { maxLength: 10 } },
  address: {
    type: 'object',
    required: false,
    options: {
      schema: {
        street: { type: 'string', options: { maxLength: 200 } },
        city: { type: 'string', options: { maxLength: 100 } },
        state: { type: 'string', options: { maxLength: 100 } },
        postalCode: { type: 'string', options: { maxLength: 20 } },
        country: { type: 'string', options: { maxLength: 100 } }
      }
    }
  },
  medicalHistory: { type: 'string', options: { maxLength: 1000, allowHtml: false } },
  totalAmount: { type: 'number', options: { min: 0, max: 1000000 } },
  discount: { type: 'number', options: { min: 0, max: 100 } },
  finalAmount: { type: 'number', options: { min: 0, max: 1000000 } },
  paymentType: { type: 'string', options: { maxLength: 50 } },
  paymentStatus: { type: 'string', options: { maxLength: 50 } },
  collectionType: { type: 'string', options: { maxLength: 50 } },
  collectionDate: { type: 'date', required: false },
  assignedTechnician: { type: 'string', options: { maxLength: 100 } },
  smsNotification: { type: 'boolean' },
  emailNotification: { type: 'boolean' },
  whatsappNotification: { type: 'boolean' },
  isVip: { type: 'boolean' },
  urgentReport: { type: 'boolean' },
  notes: { type: 'string', options: { maxLength: 500, allowHtml: false } },
  selectedTests: {
    type: 'array',
    options: {
      itemSchema: {
        id: { type: 'string', required: true, options: { maxLength: 100 } },
        name: { type: 'string', required: true, options: { maxLength: 200 } },
        price: { type: 'number', required: true, options: { min: 0, max: 100000 } }
      }
    }
  }
};

export default {
  sanitizeString,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  sanitizeObjectId,
  sanitizeDate,
  sanitizeObject,
  sanitizeBody,
  sanitizeQuery,
  sanitizeParams,
  generalSanitization,
  patientRegistrationSchema
};