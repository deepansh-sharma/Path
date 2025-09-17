import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getEquipment,
  getEquipmentItem,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  addMaintenanceRecord,
  addCalibrationRecord,
  addUsageRecord,
  getMaintenanceDue,
  getCalibrationDue,
  getEquipmentStats,
  generateEquipmentReport
} from '../controllers/equipmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createEquipmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Model must be between 1 and 100 characters'),
  body('manufacturer')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Manufacturer must be between 1 and 100 characters'),
  body('serialNumber')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Serial number must be between 1 and 100 characters'),
  body('category')
    .isIn(['analytical', 'sample_prep', 'safety', 'storage', 'general', 'diagnostic', 'research'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['operational', 'maintenance', 'repair', 'calibration', 'retired', 'out_of_service'])
    .withMessage('Invalid status'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('warrantyExpiry')
    .optional()
    .isISO8601()
    .withMessage('Warranty expiry must be a valid date'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('location.building')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Building must be between 1 and 50 characters'),
  body('location.room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
];

const updateEquipmentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('status')
    .optional()
    .isIn(['operational', 'maintenance', 'repair', 'calibration', 'retired', 'out_of_service'])
    .withMessage('Invalid status'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Purchase price must be a non-negative number'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID')
];

const maintenanceValidation = [
  body('type')
    .isIn(['preventive', 'corrective', 'emergency', 'routine'])
    .withMessage('Invalid maintenance type'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Description must be between 5 and 500 characters'),
  body('performedBy')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Performed by must be between 2 and 100 characters'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number'),
  body('nextDueDate')
    .optional()
    .isISO8601()
    .withMessage('Next due date must be a valid date'),
  body('partsReplaced')
    .optional()
    .isArray()
    .withMessage('Parts replaced must be an array'),
  body('partsReplaced.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Part name must be between 1 and 100 characters')
];

const calibrationValidation = [
  body('type')
    .isIn(['internal', 'external', 'self'])
    .withMessage('Invalid calibration type'),
  body('standard')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Standard must be between 2 and 100 characters'),
  body('performedBy')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Performed by must be between 2 and 100 characters'),
  body('certificateNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Certificate number must be between 1 and 100 characters'),
  body('nextDueDate')
    .isISO8601()
    .withMessage('Next due date must be a valid date'),
  body('results.passed')
    .isBoolean()
    .withMessage('Results passed must be a boolean'),
  body('cost')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost must be a non-negative number')
];

const usageValidation = [
  body('startTime')
    .isISO8601()
    .withMessage('Start time must be a valid date'),
  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date'),
  body('purpose')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Purpose must be between 2 and 200 characters'),
  body('sampleId')
    .optional()
    .isMongoId()
    .withMessage('Invalid sample ID'),
  body('testId')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID')
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
    .isIn(['name', 'model', 'manufacturer', 'category', 'status', 'purchaseDate', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid equipment ID')
];

// Routes

// GET /api/equipment - Get all equipment with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  getEquipment
);

// GET /api/equipment/stats - Get equipment statistics
router.get('/stats',
  authorize(['admin', 'lab_manager', 'equipment_manager']),
  getEquipmentStats
);

// GET /api/equipment/maintenance-due - Get equipment due for maintenance
router.get('/maintenance-due',
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  getMaintenanceDue
);

// GET /api/equipment/calibration-due - Get equipment due for calibration
router.get('/calibration-due',
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  getCalibrationDue
);

// GET /api/equipment/report - Generate equipment report
router.get('/report',
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Format must be json, csv, or pdf'),
  query('category')
    .optional()
    .isIn(['analytical', 'sample_prep', 'safety', 'storage', 'general', 'diagnostic', 'research'])
    .withMessage('Invalid category'),
  query('status')
    .optional()
    .isIn(['operational', 'maintenance', 'repair', 'calibration', 'retired', 'out_of_service'])
    .withMessage('Invalid status'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'equipment_manager']),
  generateEquipmentReport
);

// GET /api/equipment/:id - Get single equipment item
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  getEquipmentItem
);

// POST /api/equipment - Create new equipment
router.post('/',
  createEquipmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'equipment_manager']),
  createEquipment
);

// POST /api/equipment/:id/maintenance - Add maintenance record
router.post('/:id/maintenance',
  idValidation,
  maintenanceValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  addMaintenanceRecord
);

// POST /api/equipment/:id/calibration - Add calibration record
router.post('/:id/calibration',
  idValidation,
  calibrationValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  addCalibrationRecord
);

// POST /api/equipment/:id/usage - Add usage record
router.post('/:id/usage',
  idValidation,
  usageValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician', 'equipment_manager']),
  addUsageRecord
);

// PUT /api/equipment/:id - Update equipment
router.put('/:id',
  idValidation,
  updateEquipmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'equipment_manager']),
  updateEquipment
);

// DELETE /api/equipment/:id - Delete equipment
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'equipment_manager']),
  deleteEquipment
);

export default router;