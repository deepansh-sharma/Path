import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  addStaff,
  removeStaff,
  updateStaff,
  getDepartmentStats,
  getDepartmentsOverview as getDepartmentOverview
} from '../controllers/departmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createDepartmentValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Code must be between 2 and 20 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('type')
    .isIn([
      'clinical', 'diagnostic', 'research', 'administrative', 'support',
      'quality', 'safety', 'it', 'finance', 'hr'
    ])
    .withMessage('Invalid department type'),
  body('location.building')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Building must be between 1 and 50 characters'),
  body('location.floor')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Floor must be between 1 and 20 characters'),
  body('location.room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  body('location.phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be between 10 and 20 characters'),
  body('location.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('head')
    .optional()
    .isMongoId()
    .withMessage('Invalid head user ID'),
  body('workingHours.monday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Monday start time must be in HH:MM format'),
  body('workingHours.monday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Monday end time must be in HH:MM format'),
  body('workingHours.tuesday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Tuesday start time must be in HH:MM format'),
  body('workingHours.tuesday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Tuesday end time must be in HH:MM format'),
  body('workingHours.wednesday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Wednesday start time must be in HH:MM format'),
  body('workingHours.wednesday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Wednesday end time must be in HH:MM format'),
  body('workingHours.thursday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Thursday start time must be in HH:MM format'),
  body('workingHours.thursday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Thursday end time must be in HH:MM format'),
  body('workingHours.friday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Friday start time must be in HH:MM format'),
  body('workingHours.friday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Friday end time must be in HH:MM format'),
  body('workingHours.saturday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Saturday start time must be in HH:MM format'),
  body('workingHours.saturday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Saturday end time must be in HH:MM format'),
  body('workingHours.sunday.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Sunday start time must be in HH:MM format'),
  body('workingHours.sunday.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Sunday end time must be in HH:MM format'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('services.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Service must be between 2 and 100 characters'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid equipment ID'),
  body('inventory')
    .optional()
    .isArray()
    .withMessage('Inventory must be an array'),
  body('inventory.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid inventory ID'),
  body('tests')
    .optional()
    .isArray()
    .withMessage('Tests must be an array'),
  body('tests.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('qualityControl.policies')
    .optional()
    .isArray()
    .withMessage('Quality control policies must be an array'),
  body('budget.annual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual budget must be non-negative'),
  body('budget.currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('notifications.email')
    .optional()
    .isEmail()
    .withMessage('Invalid notification email'),
  body('notifications.sms')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('SMS number must be between 10 and 20 characters')
];

const updateDepartmentValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  body('location.building')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Building must be between 1 and 50 characters'),
  body('location.floor')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Floor must be between 1 and 20 characters'),
  body('location.room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  body('location.phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone must be between 10 and 20 characters'),
  body('location.email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('head')
    .optional()
    .isMongoId()
    .withMessage('Invalid head user ID'),
  body('services')
    .optional()
    .isArray()
    .withMessage('Services must be an array'),
  body('equipment')
    .optional()
    .isArray()
    .withMessage('Equipment must be an array'),
  body('equipment.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid equipment ID'),
  body('inventory')
    .optional()
    .isArray()
    .withMessage('Inventory must be an array'),
  body('inventory.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid inventory ID'),
  body('tests')
    .optional()
    .isArray()
    .withMessage('Tests must be an array'),
  body('tests.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('budget.annual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Annual budget must be non-negative'),
  body('notifications.email')
    .optional()
    .isEmail()
    .withMessage('Invalid notification email')
];

const staffValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('role')
    .isIn(['head', 'supervisor', 'technician', 'assistant', 'intern', 'consultant'])
    .withMessage('Invalid role'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
  body('workSchedule')
    .optional()
    .isObject()
    .withMessage('Work schedule must be an object')
];

const updateStaffValidation = [
  body('role')
    .optional()
    .isIn(['head', 'supervisor', 'technician', 'assistant', 'intern', 'consultant'])
    .withMessage('Invalid role'),
  body('active')
    .optional()
    .isBoolean()
    .withMessage('Active must be a boolean'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
  body('workSchedule')
    .optional()
    .isObject()
    .withMessage('Work schedule must be an object')
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
    .isIn(['name', 'code', 'type', 'active', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid department ID')
];

const staffIdValidation = [
  param('staffId')
    .isMongoId()
    .withMessage('Invalid staff ID')
];

// Routes

// GET /api/departments - Get all departments with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head', 'hr_manager']),
  getDepartments
);

// GET /api/departments/stats - Get department statistics
router.get('/stats',
  authorize(['admin', 'lab_manager', 'hr_manager']),
  getDepartmentStats
);

// GET /api/departments/overview - Get departments overview
router.get('/overview',
  authorize(['admin', 'lab_manager', 'department_head']),
  getDepartmentOverview
);

// GET /api/departments/:id - Get single department
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head', 'hr_manager']),
  getDepartment
);

// POST /api/departments - Create new department
router.post('/',
  createDepartmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager']),
  createDepartment
);

// POST /api/departments/:id/staff - Add staff to department
router.post('/:id/staff',
  idValidation,
  staffValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head', 'hr_manager']),
  addStaff
);

// PUT /api/departments/:id - Update department
router.put('/:id',
  idValidation,
  updateDepartmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head']),
  updateDepartment
);

// PUT /api/departments/:id/staff/:staffId - Update staff in department
router.put('/:id/staff/:staffId',
  idValidation,
  staffIdValidation,
  updateStaffValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head', 'hr_manager']),
  updateStaff
);

// DELETE /api/departments/:id - Delete department
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager']),
  deleteDepartment
);

// DELETE /api/departments/:id/staff/:staffId - Remove staff from department
router.delete('/:id/staff/:staffId',
  idValidation,
  staffIdValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'department_head', 'hr_manager']),
  removeStaff
);

export default router;