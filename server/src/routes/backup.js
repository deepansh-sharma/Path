import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getBackupJobs,
  getBackupJob,
  createBackupJob,
  updateBackupJob,
  deleteBackupJob,
  executeBackupJob,
  stopBackupJob,
  getExecutionHistory,
  getBackupStats,
  testBackupConfig
} from '../controllers/backupController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createBackupJobValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('type')
    .isIn(['full', 'incremental', 'differential', 'database', 'files', 'system'])
    .withMessage('Invalid backup type'),
  body('schedule.frequency')
    .isIn(['manual', 'daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Invalid schedule frequency'),
  body('schedule.time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('schedule.dayOfWeek')
    .optional()
    .isInt({ min: 0, max: 6 })
    .withMessage('Day of week must be between 0 and 6'),
  body('schedule.dayOfMonth')
    .optional()
    .isInt({ min: 1, max: 31 })
    .withMessage('Day of month must be between 1 and 31'),
  body('schedule.cronExpression')
    .optional()
    .trim()
    .isLength({ min: 9, max: 100 })
    .withMessage('Cron expression must be between 9 and 100 characters'),
  body('source.type')
    .isIn(['database', 'files', 'system', 'application'])
    .withMessage('Invalid source type'),
  body('source.path')
    .optional()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Source path must be between 1 and 500 characters'),
  body('source.databases')
    .optional()
    .isArray()
    .withMessage('Databases must be an array'),
  body('source.excludePatterns')
    .optional()
    .isArray()
    .withMessage('Exclude patterns must be an array'),
  body('destination.type')
    .isIn(['local', 'network', 'cloud', 'ftp', 's3', 'azure', 'gcp'])
    .withMessage('Invalid destination type'),
  body('destination.path')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Destination path must be between 1 and 500 characters'),
  body('destination.credentials')
    .optional()
    .isObject()
    .withMessage('Credentials must be an object'),
  body('compression.enabled')
    .optional()
    .isBoolean()
    .withMessage('Compression enabled must be a boolean'),
  body('compression.algorithm')
    .optional()
    .isIn(['gzip', 'bzip2', 'lzma', 'zip', '7z'])
    .withMessage('Invalid compression algorithm'),
  body('compression.level')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Compression level must be between 1 and 9'),
  body('encryption.enabled')
    .optional()
    .isBoolean()
    .withMessage('Encryption enabled must be a boolean'),
  body('encryption.algorithm')
    .optional()
    .isIn(['AES-256', 'AES-128', 'RSA', 'GPG'])
    .withMessage('Invalid encryption algorithm'),
  body('retentionPolicy.keepDaily')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Keep daily must be between 1 and 365'),
  body('retentionPolicy.keepWeekly')
    .optional()
    .isInt({ min: 1, max: 52 })
    .withMessage('Keep weekly must be between 1 and 52'),
  body('retentionPolicy.keepMonthly')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Keep monthly must be between 1 and 12'),
  body('retentionPolicy.keepYearly')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Keep yearly must be between 1 and 10'),
  body('notifications.onSuccess')
    .optional()
    .isBoolean()
    .withMessage('On success notification must be a boolean'),
  body('notifications.onFailure')
    .optional()
    .isBoolean()
    .withMessage('On failure notification must be a boolean'),
  body('notifications.emails')
    .optional()
    .isArray()
    .withMessage('Notification emails must be an array'),
  body('notifications.emails.*')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('maxExecutionTime')
    .optional()
    .isInt({ min: 60, max: 86400 })
    .withMessage('Max execution time must be between 60 and 86400 seconds'),
  body('dependencies')
    .optional()
    .isArray()
    .withMessage('Dependencies must be an array'),
  body('dependencies.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid dependency ID'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const updateBackupJobValidation = [
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
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('Enabled must be a boolean'),
  body('schedule.frequency')
    .optional()
    .isIn(['manual', 'daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Invalid schedule frequency'),
  body('schedule.time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in HH:MM format'),
  body('retentionPolicy.keepDaily')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Keep daily must be between 1 and 365'),
  body('notifications.onSuccess')
    .optional()
    .isBoolean()
    .withMessage('On success notification must be a boolean'),
  body('notifications.onFailure')
    .optional()
    .isBoolean()
    .withMessage('On failure notification must be a boolean'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'critical'])
    .withMessage('Invalid priority'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const testConfigValidation = [
  body('destination.type')
    .isIn(['local', 'network', 'cloud', 'ftp', 's3', 'azure', 'gcp'])
    .withMessage('Invalid destination type'),
  body('destination.path')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Destination path must be between 1 and 500 characters'),
  body('destination.credentials')
    .optional()
    .isObject()
    .withMessage('Credentials must be an object')
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
    .isIn(['name', 'type', 'status', 'lastExecution', 'nextExecution', 'priority', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const historyValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['running', 'completed', 'failed', 'cancelled', 'timeout'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid backup job ID')
];

// Routes

// GET /api/backup - Get all backup jobs with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'backup_admin', 'system_admin']),
  getBackupJobs
);

// GET /api/backup/stats - Get backup statistics
router.get('/stats',
  authorize(['admin', 'backup_admin', 'system_admin']),
  getBackupStats
);

// GET /api/backup/:id - Get single backup job
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'backup_admin', 'system_admin']),
  getBackupJob
);

// GET /api/backup/:id/history - Get execution history for backup job
router.get('/:id/history',
  idValidation,
  historyValidation,
  validateRequest,
  authorize(['admin', 'backup_admin', 'system_admin']),
  getExecutionHistory
);

// POST /api/backup - Create new backup job
router.post('/',
  createBackupJobValidation,
  validateRequest,
  authorize(['admin', 'backup_admin']),
  createBackupJob
);

// POST /api/backup/:id/execute - Execute backup job manually
router.post('/:id/execute',
  idValidation,
  validateRequest,
  authorize(['admin', 'backup_admin', 'system_admin']),
  executeBackupJob
);

// POST /api/backup/:id/stop - Stop running backup job
router.post('/:id/stop',
  idValidation,
  validateRequest,
  authorize(['admin', 'backup_admin', 'system_admin']),
  stopBackupJob
);

// POST /api/backup/test-config - Test backup configuration
router.post('/test-config',
  testConfigValidation,
  validateRequest,
  authorize(['admin', 'backup_admin']),
  testBackupConfig
);

// PUT /api/backup/:id - Update backup job
router.put('/:id',
  idValidation,
  updateBackupJobValidation,
  validateRequest,
  authorize(['admin', 'backup_admin']),
  updateBackupJob
);

// DELETE /api/backup/:id - Delete backup job
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'backup_admin']),
  deleteBackupJob
);

export default router;