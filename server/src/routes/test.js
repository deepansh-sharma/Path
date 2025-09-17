import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getTests,
  getTest,
  createTest,
  updateTest,
  deleteTest,
  getTestCategories,
  getTestStats,
  updateTestPricing,
  bulkUpdateTests,
  getTestQualityControl as getQualityControlData
} from '../controllers/testController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createTestValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Code must be between 2 and 50 characters'),
  body('category')
    .isIn([
      'hematology', 'biochemistry', 'microbiology', 'immunology', 'molecular',
      'pathology', 'radiology', 'cardiology', 'endocrinology', 'toxicology',
      'genetics', 'serology', 'virology', 'parasitology', 'mycology'
    ])
    .withMessage('Invalid category'),
  body('type')
    .isIn(['quantitative', 'qualitative', 'semi_quantitative', 'culture', 'imaging'])
    .withMessage('Invalid test type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('methodology')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Methodology must not exceed 500 characters'),
  body('specimen.type')
    .isIn([
      'blood', 'serum', 'plasma', 'urine', 'stool', 'saliva', 'csf',
      'tissue', 'swab', 'sputum', 'other'
    ])
    .withMessage('Invalid specimen type'),
  body('specimen.volume')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Specimen volume must be non-negative'),
  body('specimen.container')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Container must not exceed 100 characters'),
  body('specimen.preparation')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Preparation must not exceed 500 characters'),
  body('parameters')
    .optional()
    .isArray()
    .withMessage('Parameters must be an array'),
  body('parameters.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Parameter name must be between 1 and 100 characters'),
  body('parameters.*.unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Parameter unit must not exceed 20 characters'),
  body('parameters.*.referenceRange.min')
    .optional()
    .isFloat()
    .withMessage('Reference range min must be a number'),
  body('parameters.*.referenceRange.max')
    .optional()
    .isFloat()
    .withMessage('Reference range max must be a number'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be non-negative'),
  body('pricing.urgentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Urgent price must be non-negative'),
  body('pricing.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('turnaroundTime.routine')
    .isInt({ min: 1, max: 10080 })
    .withMessage('Routine turnaround time must be between 1 and 10080 minutes'),
  body('turnaroundTime.urgent')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Urgent turnaround time must be between 1 and 1440 minutes'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid equipment ID'),
  body('reagents')
    .optional()
    .isArray()
    .withMessage('Reagents must be an array'),
  body('reagents.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Reagent name must be between 1 and 100 characters'),
  body('reagents.*.quantity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Reagent quantity must be non-negative'),
  body('qualityControl.required')
    .optional()
    .isBoolean()
    .withMessage('Quality control required must be a boolean'),
  body('qualityControl.frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'per_batch', 'as_needed'])
    .withMessage('Invalid quality control frequency'),
  body('interpretation.criticalValues')
    .optional()
    .isArray()
    .withMessage('Critical values must be an array'),
  body('reporting.template')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Reporting template must not exceed 2000 characters'),
  body('workflow.preAnalytical')
    .optional()
    .isArray()
    .withMessage('Pre-analytical workflow must be an array'),
  body('workflow.analytical')
    .optional()
    .isArray()
    .withMessage('Analytical workflow must be an array'),
  body('workflow.postAnalytical')
    .optional()
    .isArray()
    .withMessage('Post-analytical workflow must be an array'),
  body('compliance.standards')
    .optional()
    .isArray()
    .withMessage('Compliance standards must be an array'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
];

const updateTestValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  body('pricing.basePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Base price must be non-negative'),
  body('pricing.urgentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Urgent price must be non-negative'),
  body('turnaroundTime.routine')
    .optional()
    .isInt({ min: 1, max: 10080 })
    .withMessage('Routine turnaround time must be between 1 and 10080 minutes'),
  body('turnaroundTime.urgent')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Urgent turnaround time must be between 1 and 1440 minutes'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid equipment ID'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
];

const pricingUpdateValidation = [
  body('basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be non-negative'),
  body('urgentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Urgent price must be non-negative'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Effective date must be a valid date')
];

const bulkUpdateValidation = [
  body('updates')
    .isArray({ min: 1, max: 100 })
    .withMessage('Updates must be an array with 1-100 items'),
  body('updates.*.testId')
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('updates.*.data')
    .isObject()
    .withMessage('Update data must be an object')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['name', 'code', 'category', 'type', 'basePrice', 'turnaroundTime', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid test ID')
];

// Routes

// GET /api/tests - Get all tests with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'test_manager']),
  getTests
);

// GET /api/tests/categories - Get test categories
router.get('/categories',
  authorize(['admin', 'lab_manager', 'technician', 'test_manager']),
  getTestCategories
);

// GET /api/tests/stats - Get test statistics
router.get('/stats',
  authorize(['admin', 'lab_manager', 'test_manager']),
  getTestStats
);

// GET /api/tests/quality-control - Get quality control data
router.get('/quality-control',
  query('category')
    .optional()
    .isIn([
      'hematology', 'biochemistry', 'microbiology', 'immunology', 'molecular',
      'pathology', 'radiology', 'cardiology', 'endocrinology', 'toxicology',
      'genetics', 'serology', 'virology', 'parasitology', 'mycology'
    ])
    .withMessage('Invalid category'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'quality_manager']),
  getQualityControlData
);

// GET /api/tests/:id - Get single test
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'test_manager']),
  getTest
);

// POST /api/tests - Create new test
router.post('/',
  createTestValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'test_manager']),
  createTest
);

// POST /api/tests/bulk-update - Bulk update tests
router.post('/bulk-update',
  bulkUpdateValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'test_manager']),
  bulkUpdateTests
);

// PUT /api/tests/:id - Update test
router.put('/:id',
  idValidation,
  updateTestValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'test_manager']),
  updateTest
);

// PUT /api/tests/:id/pricing - Update test pricing
router.put('/:id/pricing',
  idValidation,
  pricingUpdateValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'finance_manager']),
  updateTestPricing
);

// DELETE /api/tests/:id - Delete test
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager']),
  deleteTest
);

export default router;