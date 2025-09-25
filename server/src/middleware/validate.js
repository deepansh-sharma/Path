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
 * Patient registration validation rules - comprehensive
 */
export const validatePatientRegistration = [
  // Basic Information - Required Fields
  body('name')
    .notEmpty()
    .withMessage('Patient name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[\d\s\-()]{10,15}$/)
    .withMessage('Phone number must be 10-15 digits and can include +, spaces, hyphens, and parentheses')
    .custom((value) => {
      // Remove all non-digit characters and check length
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        throw new Error('Phone number must contain 10-15 digits');
      }
      return true;
    }),

  // Optional but validated fields
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Valid email address is required')
    .isLength({ max: 100 })
    .withMessage('Email cannot exceed 100 characters')
    .normalizeEmail()
    .custom((value) => {
      // Additional email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),

  body('age')
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150')
    .custom((value, { req }) => {
      // Cross-validate with dateOfBirth if provided
      if (req.body.dateOfBirth && value) {
        const birthDate = new Date(req.body.dateOfBirth);
        const today = new Date();
        const calculatedAge = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
        if (Math.abs(calculatedAge - value) > 1) {
          throw new Error('Age does not match date of birth');
        }
      }
      return true;
    }),

  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid date of birth is required (YYYY-MM-DD format)')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 150, today.getMonth(), today.getDate());
      
      if (birthDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      if (birthDate < minDate) {
        throw new Error('Date of birth cannot be more than 150 years ago');
      }
      return true;
    }),

  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group. Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'),

  // Address Information - Enhanced validation
  body('address.street')
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage('Street address cannot exceed 200 characters')
    .trim()
    .escape(),

  body('address.city')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('City can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  body('address.state')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('State must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('State can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  body('address.zip')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{5,10}$/)
    .withMessage('ZIP code must be 5-10 digits')
    .trim(),

  body('address.country')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Country must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Country can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  // Medical Information - Enhanced validation
  body('allergies')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Allergies description cannot exceed 1000 characters')
    .trim()
    .escape(),

  body('medicalHistory')
    .optional({ checkFalsy: true })
    .isLength({ max: 2000 })
    .withMessage('Medical history cannot exceed 2000 characters')
    .trim()
    .escape(),

  body('referringDoctor')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Referring doctor name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Doctor name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  body('patientCategory')
    .optional({ checkFalsy: true })
    .isIn(['OPD', 'Inpatient', 'Home Collection', 'Emergency'])
    .withMessage('Invalid patient category. Must be one of: OPD, Inpatient, Home Collection, Emergency'),

  // Payment Information - Enhanced validation
  body('totalAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Total amount must be between 0 and 1,000,000')
    .custom((value) => {
      // Check for reasonable decimal places
      if (value && value.toString().split('.')[1]?.length > 2) {
        throw new Error('Amount cannot have more than 2 decimal places');
      }
      return true;
    }),

  body('discount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Discount must be between 0 and 100,000')
    .custom((value, { req }) => {
      // Validate discount doesn't exceed total amount
      if (value && req.body.totalAmount && value > req.body.totalAmount) {
        throw new Error('Discount cannot exceed total amount');
      }
      return true;
    }),

  body('paymentType')
    .optional({ checkFalsy: true })
    .isIn(['Cash', 'Card', 'UPI', 'Insurance', 'Pending'])
    .withMessage('Invalid payment type. Must be one of: Cash, Card, UPI, Insurance, Pending'),

  body('finalAmount')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 1000000 })
    .withMessage('Final amount must be between 0 and 1,000,000')
    .custom((value, { req }) => {
      // Validate final amount calculation
      if (value && req.body.totalAmount && req.body.discount) {
        const expectedFinal = req.body.totalAmount - req.body.discount;
        if (Math.abs(value - expectedFinal) > 0.01) {
          throw new Error('Final amount must equal total amount minus discount');
        }
      }
      return true;
    }),

  // Collection Information - Enhanced validation
  body('collectionType')
    .optional({ checkFalsy: true })
    .isIn(['In-lab', 'Home Collection'])
    .withMessage('Invalid collection type. Must be either In-lab or Home Collection'),

  body('assignedTechnician')
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage('Assigned technician name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s.'-]+$/)
    .withMessage('Technician name can only contain letters, spaces, dots, apostrophes, and hyphens')
    .trim()
    .escape(),

  body('collectionDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid collection date is required (YYYY-MM-DD format)')
    .custom((value) => {
      const collectionDate = new Date(value);
      const today = new Date();
      const maxFutureDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
      
      if (collectionDate < today.setHours(0, 0, 0, 0)) {
        throw new Error('Collection date cannot be in the past');
      }
      if (collectionDate > maxFutureDate) {
        throw new Error('Collection date cannot be more than 30 days in the future');
      }
      return true;
    }),

  // Notification Preferences - Enhanced validation
  body('smsNotification')
    .optional()
    .isBoolean()
    .withMessage('SMS notification must be true or false'),

  body('emailNotification')
    .optional()
    .isBoolean()
    .withMessage('Email notification must be true or false')
    .custom((value, { req }) => {
      // Require email if email notification is enabled
      if (value === true && !req.body.email) {
        throw new Error('Email address is required when email notification is enabled');
      }
      return true;
    }),

  body('whatsappNotification')
    .optional()
    .isBoolean()
    .withMessage('WhatsApp notification must be true or false'),

  // Admin Fields - Enhanced validation
  body('vipStatus')
    .optional()
    .isBoolean()
    .withMessage('VIP status must be true or false'),

  body('urgentReport')
    .optional()
    .isBoolean()
    .withMessage('Urgent report must be true or false'),

  body('notes')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim()
    .escape(),

  body('reportDeliveryDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Valid report delivery date is required (YYYY-MM-DD format)')
    .custom((value, { req }) => {
      const deliveryDate = new Date(value);
      const today = new Date();
      const collectionDate = req.body.collectionDate ? new Date(req.body.collectionDate) : today;
      const maxDeliveryDate = new Date(today.getTime() + (60 * 24 * 60 * 60 * 1000)); // 60 days from now
      
      if (deliveryDate < collectionDate) {
        throw new Error('Report delivery date cannot be before collection date');
      }
      if (deliveryDate > maxDeliveryDate) {
        throw new Error('Report delivery date cannot be more than 60 days from today');
      }
      return true;
    }),

  // Selected Tests - Enhanced validation
  body('selectedTests')
    .optional()
    .isArray({ min: 0, max: 50 })
    .withMessage('Selected tests must be an array with maximum 50 tests'),

  body('selectedTests.*.id')
    .if(body('selectedTests').exists())
    .notEmpty()
    .withMessage('Test ID is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Test ID must be between 1 and 50 characters')
    .trim(),

  body('selectedTests.*.name')
    .if(body('selectedTests').exists())
    .notEmpty()
    .withMessage('Test name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Test name must be between 2 and 200 characters')
    .trim()
    .escape(),

  body('selectedTests.*.price')
    .if(body('selectedTests').exists())
    .isFloat({ min: 0, max: 100000 })
    .withMessage('Test price must be between 0 and 100,000')
    .custom((value) => {
      // Check for reasonable decimal places
      if (value && value.toString().split('.')[1]?.length > 2) {
        throw new Error('Test price cannot have more than 2 decimal places');
      }
      return true;
    }),

  // Custom validation for test price consistency
  body('selectedTests')
    .optional()
    .custom((tests, { req }) => {
      if (tests && tests.length > 0 && req.body.totalAmount) {
        const calculatedTotal = tests.reduce((sum, test) => sum + (test.price || 0), 0);
        if (Math.abs(calculatedTotal - req.body.totalAmount) > 0.01) {
          throw new Error('Total amount must equal the sum of selected test prices');
        }
      }
      return true;
    }),

  validateRequest
];

/**
 * Patient update validation rules
 */
export const validatePatientUpdate = [
  // Basic Information (all optional for updates)
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .trim(),

  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),

  body('age')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),

  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .withMessage('Invalid blood group'),

  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Address cannot exceed 500 characters')
    .trim(),

  body('allergies')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Allergies cannot exceed 1000 characters')
    .trim(),

  body('medicalHistory')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Medical history cannot exceed 2000 characters')
    .trim(),

  body('referringDoctor')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Referring doctor name cannot exceed 100 characters')
    .trim(),

  body('patientCategory')
    .optional()
    .isIn(['OPD', 'IPD', 'Emergency', 'Home Collection', 'Corporate'])
    .withMessage('Invalid patient category'),

  body('status')
    .optional()
    .isIn(['active', 'inactive', 'archived'])
    .withMessage('Invalid patient status'),

  body('vipStatus')
    .optional()
    .isBoolean()
    .withMessage('VIP status must be true or false'),

  body('urgentReport')
    .optional()
    .isBoolean()
    .withMessage('Urgent report must be true or false'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim(),

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