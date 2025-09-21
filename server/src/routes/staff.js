import { Router } from "express";
import { body, query, param } from "express-validator";
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
  updateStaffRole,
  getStaffDashboard,
  getStaffAnalytics,
  getStaffPerformance,
  bulkUpdateStaff,
  exportStaff,
  importStaff,
  getRolesAndPermissions,
  sendInvitation,
  resendInvitation,
  getMyDashboard
} from "../controllers/staffController.js";
import { authenticate } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { validateRequest } from "../middleware/validation.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Apply authentication to all routes
router.use(authenticate);

// GET /api/staff/my-dashboard - Get the logged-in staff member's dashboard
router.get('/my-dashboard', rbac(['lab_admin', 'technician', 'receptionist', 'finance', 'staff']), getMyDashboard);


// Validation rules
const createStaffValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('role')
    .isIn(['lab_admin', 'technician', 'receptionist', 'finance', 'staff'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('hireDate')
    .optional()
    .isISO8601()
    .withMessage('Valid hire date is required'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('emergencyContact')
    .optional()
    .isMobilePhone()
    .withMessage('Valid emergency contact is required'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
];

const updateStaffValidation = [
  param('staffId')
    .isMongoId()
    .withMessage('Invalid staff ID'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['lab_admin', 'technician', 'receptionist', 'finance', 'staff'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address must not exceed 500 characters'),
  body('emergencyContact')
    .optional()
    .isMobilePhone()
    .withMessage('Valid emergency contact is required'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array')
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
  query('role')
    .optional()
    .isIn(['lab_admin', 'technician', 'receptionist', 'finance', 'staff'])
    .withMessage('Invalid role filter'),
  query('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status filter'),
  query('department')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Department filter cannot be empty'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty')
];

const idValidation = [
  param('staffId')
    .isMongoId()
    .withMessage('Invalid staff ID')
];

const labIdValidation = [
  param('labId')
    .isMongoId()
    .withMessage('Invalid lab ID')
];

// Routes

// GET /api/labs/:labId/staff - Get all staff members
router.get('/:labId/staff',
  labIdValidation,
  queryValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  getStaff
);

// GET /api/labs/:labId/staff/dashboard - Get staff dashboard data
router.get('/:labId/staff/dashboard',
  labIdValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  getStaffDashboard
);

// GET /api/labs/:labId/staff/analytics - Get staff analytics
router.get('/:labId/staff/analytics',
  labIdValidation,
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  getStaffAnalytics
);

// GET /api/labs/:labId/staff/export - Export staff data
router.get('/:labId/staff/export',
  labIdValidation,
  query('format')
    .optional()
    .isIn(['csv', 'xlsx', 'pdf'])
    .withMessage('Invalid export format'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  exportStaff
);

// GET /api/staff/roles-permissions - Get available roles and permissions
router.get('/roles-permissions',
  rbac(['lab_admin', 'super_admin']),
  getRolesAndPermissions
);

// GET /api/labs/:labId/staff/:staffId - Get staff member by ID
router.get('/:labId/staff/:staffId',
  labIdValidation,
  idValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  getStaffById
);

// GET /api/labs/:labId/staff/:staffId/performance - Get staff performance
router.get('/:labId/staff/:staffId/performance',
  labIdValidation,
  idValidation,
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Valid start date is required'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Valid end date is required'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  getStaffPerformance
);

// POST /api/labs/:labId/staff - Create new staff member
router.post('/:labId/staff',
  labIdValidation,
  createStaffValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  createStaff
);

// POST /api/labs/:labId/staff/import - Import staff data
router.post('/:labId/staff/import',
  labIdValidation,
  upload.single('file'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  importStaff
);

// POST /api/labs/:labId/staff/invite - Send staff invitation
router.post('/:labId/staff/invite',
  labIdValidation,
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('role')
    .isIn(['lab_admin', 'technician', 'receptionist', 'finance', 'staff'])
    .withMessage('Invalid role'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  sendInvitation
);

// POST /api/labs/:labId/staff/:staffId/resend-invitation - Resend invitation
router.post('/:labId/staff/:staffId/resend-invitation',
  labIdValidation,
  idValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  resendInvitation
);

// PUT /api/labs/:labId/staff/:staffId - Update staff member
router.put('/:labId/staff/:staffId',
  labIdValidation,
  updateStaffValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  updateStaff
);

// PATCH /api/labs/:labId/staff/:staffId/status - Toggle staff status
router.patch('/:labId/staff/:staffId/status',
  labIdValidation,
  idValidation,
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  toggleStaffStatus
);

// PATCH /api/labs/:labId/staff/:staffId/role - Update staff role
router.patch('/:labId/staff/:staffId/role',
  labIdValidation,
  idValidation,
  body('role')
    .isIn(['lab_admin', 'technician', 'receptionist', 'finance', 'staff'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  updateStaffRole
);

// PATCH /api/labs/:labId/staff/bulk - Bulk update staff
router.patch('/:labId/staff/bulk',
  labIdValidation,
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  body('updates.*.staffId')
    .isMongoId()
    .withMessage('Invalid staff ID in updates'),
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  bulkUpdateStaff
);

// DELETE /api/labs/:labId/staff/:staffId - Delete staff member
router.delete('/:labId/staff/:staffId',
  labIdValidation,
  idValidation,
  validateRequest,
  rbac(['lab_admin', 'super_admin']),
  deleteStaff
);

export default router;