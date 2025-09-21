/**
 * Validation middleware for different entities
 * Contains specific validation rules for labs, users, patients, etc.
 */

import { body, param, query } from 'express-validator';
import { validateRequest } from './validation.js';

/**
 * Lab validation rules
 */
export const validateLab = [
  // Lab name validation
  body('name')
    .notEmpty()
    .withMessage('Lab name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Lab name must be between 2 and 100 characters')
    .trim(),

  // Email validation
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  // Phone validation
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  // Address validation
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
    .trim(),

  // City validation
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters')
    .trim(),

  // State validation
  body('state')
    .optional()
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters')
    .trim(),

  // Postal code validation
  body('postalCode')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Postal code cannot exceed 20 characters')
    .trim(),

  // Country validation
  body('country')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters')
    .trim(),

  // License number validation
  body('licenseNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('License number cannot exceed 50 characters')
    .trim(),

  // Subscription plan validation
  body('subscription.plan')
    .optional()
    .isIn(['basic', 'standard', 'premium', 'enterprise'])
    .withMessage('Invalid subscription plan'),

  // Apply validation
  validateRequest
];

/**
 * Lab ID parameter validation
 */
export const validateLabId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid lab ID format'),
  validateRequest
];

/**
 * User validation rules
 */
export const validateUser = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),

  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('role')
    .isIn(['super_admin', 'lab_admin', 'staff', 'patient'])
    .withMessage('Invalid user role'),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  validateRequest
];

/**
 * Patient validation rules
 */
export const validatePatient = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .trim(),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .trim(),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),

  validateRequest
];

/**
 * Report validation rules
 */
export const validateReport = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),

  body('testType')
    .notEmpty()
    .withMessage('Test type is required')
    .trim(),

  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid report status'),

  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority level'),

  validateRequest
];

/**
 * Sample validation rules
 */
export const validateSample = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),

  body('sampleType')
    .notEmpty()
    .withMessage('Sample type is required')
    .trim(),

  body('collectionDate')
    .optional()
    .isISO8601()
    .withMessage('Valid collection date is required'),

  body('status')
    .optional()
    .isIn(['collected', 'received', 'processing', 'completed', 'rejected'])
    .withMessage('Invalid sample status'),

  validateRequest
];

/**
 * Invoice validation rules
 */
export const validateInvoice = [
  body('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('At least one item is required'),

  body('items.*.description')
    .notEmpty()
    .withMessage('Item description is required'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),

  body('items.*.unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Item unit price must be a positive number'),

  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Valid due date is required'),

  validateRequest
];

console.log('📋 Validation middleware loaded successfully');
console.log('✅ Available validators: validateLab, validateUser, validatePatient, validateReport, validateSample, validateInvoice');