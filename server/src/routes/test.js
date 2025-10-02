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
  getTestQualityControl as getQualityControlData,
  cloneTest,
  toggleTestStatus,
  bulkDeleteTests,
  bulkUpdateTestStatus,
  exportTests,
  importTests,
  getPopularTests,
  searchTests,
  getDepartments,
  getSpecimenTypes,
  validateTestCode,
  getTestTemplates,
  getTestReagents,
  getTestHistory,
  submitTestForApproval,
  approveTest,
  rejectTest
} from '../controllers/testController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { rbac } from '../middleware/rbac.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads (CSV/JSON import)
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only CSV and JSON files
    const allowedTypes = /csv|json/;
    const extname = allowedTypes.test(file.originalname.split('.').pop().toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/json' || file.mimetype === 'text/csv';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only CSV and JSON files are allowed"));
    }
  },
});

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

// Test management routes with role-based access control
router.get('/', 
  queryValidation,
  validateRequest,
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getTests
);

router.get('/popular',
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getPopularTests
);

router.get('/search',
  query('q').notEmpty().withMessage('Search query is required'),
  validateRequest,
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  searchTests
);

router.get('/departments',
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getDepartments
);

router.get('/specimen-types',
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getSpecimenTypes
);

router.get('/templates',
  rbac(['lab_admin', 'technician'], ['manage_tests']),
  getTestTemplates
);

router.get('/reagents',
  rbac(['lab_admin', 'technician'], ['manage_tests']),
  getTestReagents
);

router.get('/categories',
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getTestCategories
);

router.get('/stats',
  rbac(['lab_admin'], ['view_analytics']),
  getTestStats
);

router.get('/validate-code',
  query('code').notEmpty().withMessage('Test code is required'),
  validateRequest,
  rbac(['lab_admin', 'technician'], ['manage_tests']),
  validateTestCode
);

router.get('/export',
  query('testIds').optional().isString().withMessage('Test IDs must be a comma-separated string'),
  query('format').optional().isIn(['csv', 'json']).withMessage('Invalid export format'),
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  exportTests
);

router.post('/import',
  upload.single('file'),
  rbac(['lab_admin'], ['manage_tests']),
  importTests
);

router.post('/bulk-delete',
  body('testIds').isArray({ min: 1 }).withMessage('Test IDs array is required'),
  body('testIds.*').isMongoId().withMessage('Invalid test ID'),
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  bulkDeleteTests
);

router.post('/bulk-status',
  body('testIds').isArray({ min: 1 }).withMessage('Test IDs array is required'),
  body('testIds.*').isMongoId().withMessage('Invalid test ID'),
  body('status').isIn(['active', 'inactive', 'draft', 'pending_approval']).withMessage('Invalid status'),
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  bulkUpdateTestStatus
);

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
  rbac(['lab_admin'], ['manage_tests']),
  getTestQualityControl
);

router.get('/:id/history',
  idValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  getTestHistory
);

router.get('/:id',
  idValidation,
  validateRequest,
  rbac(['lab_admin', 'technician', 'staff'], ['manage_tests', 'view_tests']),
  getTest
);

// Test CRUD operations - Only lab_admin can create/update/delete tests
router.post('/',
  createTestValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  createTest
);

router.put('/:id',
  idValidation,
  updateTestValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  updateTest
);

router.delete('/:id',
  idValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  deleteTest
);

// Test status management - Lab admin and technicians can manage status
router.patch('/:id/toggle-status',
  idValidation,
  validateRequest,
  rbac(['lab_admin', 'technician'], ['manage_tests']),
  toggleTestStatus
);

router.post('/:id/clone',
  idValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  cloneTest
);

// Test approval workflow - Staff can submit, only lab_admin can approve/reject
router.post('/:id/submit-approval',
  idValidation,
  validateRequest,
  rbac(['technician', 'staff'], ['manage_tests']),
  submitTestForApproval
);

router.post('/:id/approve',
  idValidation,
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must not exceed 500 characters'),
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  approveTest
);

router.post('/:id/reject',
  idValidation,
  body('reason').notEmpty().withMessage('Rejection reason is required'),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('Comments must not exceed 500 characters'),
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  rejectTest
);

router.post('/bulk-update',
  bulkUpdateValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  bulkUpdateTests
);

router.put('/:id/pricing',
  idValidation,
  pricingUpdateValidation,
  validateRequest,
  rbac(['lab_admin'], ['manage_tests']),
  updateTestPricing
);

export default router;