import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getAuditLogs,
  getAuditLog,
  createAuditLog,
  getAuditStats,
  getComplianceReport,
  getRiskAnalysis,
  exportAuditLogs,
  archiveOldLogs
} from '../controllers/auditController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createAuditLogValidation = [
  body('action')
    .isIn([
      'create', 'read', 'update', 'delete', 'login', 'logout', 'access_denied',
      'password_change', 'role_change', 'data_export', 'data_import', 'backup',
      'restore', 'configuration_change', 'system_error', 'security_alert'
    ])
    .withMessage('Invalid action type'),
  body('resource')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Resource must be between 1 and 100 characters'),
  body('resourceId')
    .optional()
    .isMongoId()
    .withMessage('Invalid resource ID'),
  body('targetUserId')
    .optional()
    .isMongoId()
    .withMessage('Invalid target user ID'),
  body('details')
    .optional()
    .isObject()
    .withMessage('Details must be an object'),
  body('ipAddress')
    .optional()
    .isIP()
    .withMessage('Invalid IP address'),
  body('userAgent')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('User agent must not exceed 500 characters'),
  body('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('category')
    .optional()
    .isIn(['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security', 'compliance'])
    .withMessage('Invalid category'),
  body('complianceStandard')
    .optional()
    .isIn(['HIPAA', 'GDPR', 'SOX', 'ISO27001', 'CLIA', 'CAP', 'FDA'])
    .withMessage('Invalid compliance standard'),
  body('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid risk level')
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
    .isIn(['timestamp', 'action', 'resource', 'userId', 'severity', 'riskLevel', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('action')
    .optional()
    .isIn([
      'create', 'read', 'update', 'delete', 'login', 'logout', 'access_denied',
      'password_change', 'role_change', 'data_export', 'data_import', 'backup',
      'restore', 'configuration_change', 'system_error', 'security_alert'
    ])
    .withMessage('Invalid action type'),
  query('resource')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Resource must be between 1 and 100 characters'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  query('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  query('category')
    .optional()
    .isIn(['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security', 'compliance'])
    .withMessage('Invalid category'),
  query('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid risk level'),
  query('complianceStandard')
    .optional()
    .isIn(['HIPAA', 'GDPR', 'SOX', 'ISO27001', 'CLIA', 'CAP', 'FDA'])
    .withMessage('Invalid compliance standard')
];

const exportValidation = [
  query('format')
    .optional()
    .isIn(['json', 'csv', 'pdf'])
    .withMessage('Format must be json, csv, or pdf'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('Include details must be a boolean')
];

const complianceReportValidation = [
  query('standard')
    .isIn(['HIPAA', 'GDPR', 'SOX', 'ISO27001', 'CLIA', 'CAP', 'FDA'])
    .withMessage('Invalid compliance standard'),
  query('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('format')
    .optional()
    .isIn(['json', 'pdf'])
    .withMessage('Format must be json or pdf')
];

const riskAnalysisValidation = [
  query('timeframe')
    .optional()
    .isIn(['24h', '7d', '30d', '90d', '1y'])
    .withMessage('Invalid timeframe'),
  query('category')
    .optional()
    .isIn(['authentication', 'authorization', 'data_access', 'data_modification', 'system', 'security', 'compliance'])
    .withMessage('Invalid category'),
  query('minRiskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid minimum risk level')
];

const archiveValidation = [
  body('olderThanDays')
    .isInt({ min: 30, max: 3650 })
    .withMessage('Older than days must be between 30 and 3650'),
  body('archiveLocation')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Archive location must be between 1 and 200 characters'),
  body('deleteAfterArchive')
    .optional()
    .isBoolean()
    .withMessage('Delete after archive must be a boolean')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid audit log ID')
];

// Routes

// GET /api/audit - Get all audit logs with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer', 'security_admin']),
  getAuditLogs
);

// GET /api/audit/stats - Get audit statistics
router.get('/stats',
  query('timeframe')
    .optional()
    .isIn(['24h', '7d', '30d', '90d', '1y'])
    .withMessage('Invalid timeframe'),
  validateRequest,
  authorize(['admin', 'compliance_officer', 'security_admin']),
  getAuditStats
);

// GET /api/audit/compliance-report - Generate compliance report
router.get('/compliance-report',
  complianceReportValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer']),
  getComplianceReport
);

// GET /api/audit/risk-analysis - Get risk analysis
router.get('/risk-analysis',
  riskAnalysisValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer', 'security_admin']),
  getRiskAnalysis
);

// GET /api/audit/export - Export audit logs
router.get('/export',
  exportValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer']),
  exportAuditLogs
);

// GET /api/audit/:id - Get single audit log
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer', 'security_admin']),
  getAuditLog
);

// POST /api/audit - Create new audit log (typically used by system)
router.post('/',
  createAuditLogValidation,
  validateRequest,
  authorize(['admin', 'system']),
  createAuditLog
);

// POST /api/audit/archive - Archive old audit logs
router.post('/archive',
  archiveValidation,
  validateRequest,
  authorize(['admin', 'compliance_officer']),
  archiveOldLogs
);

export default router;