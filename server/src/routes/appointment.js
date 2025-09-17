import express from 'express';
import { body, query, param } from 'express-validator';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkAvailability,
  rescheduleAppointment,
  cancelAppointment,
  checkInAppointment,
  checkOutAppointment,
  getAppointmentStats
} from '../controllers/appointmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createAppointmentValidation = [
  body('patientName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Patient name must be between 2 and 100 characters'),
  body('patientEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('patientPhone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('patientAge')
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage('Age must be between 0 and 150'),
  body('patientGender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Invalid gender'),
  body('appointmentDate')
    .isISO8601()
    .withMessage('Appointment date must be a valid date'),
  body('timeSlot.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('timeSlot.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('type')
    .isIn(['routine', 'urgent', 'follow_up', 'consultation', 'screening'])
    .withMessage('Invalid appointment type'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Invalid status'),
  body('tests')
    .optional()
    .isArray()
    .withMessage('Tests must be an array'),
  body('tests.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('assignedStaff')
    .optional()
    .isArray()
    .withMessage('Assigned staff must be an array'),
  body('assignedStaff.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  body('estimatedDuration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('referralDoctor')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Referral doctor must be between 2 and 100 characters'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card', 'insurance', 'online', 'bank_transfer'])
    .withMessage('Invalid payment method'),
  body('paymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be non-negative')
];

const updateAppointmentValidation = [
  body('patientName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Patient name must be between 2 and 100 characters'),
  body('patientEmail')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('patientPhone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('status')
    .optional()
    .isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
    .withMessage('Invalid status'),
  body('tests')
    .optional()
    .isArray()
    .withMessage('Tests must be an array'),
  body('tests.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid test ID'),
  body('assignedStaff')
    .optional()
    .isArray()
    .withMessage('Assigned staff must be an array'),
  body('assignedStaff.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid staff ID'),
  body('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  body('room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority'),
  body('paymentAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be non-negative')
];

const rescheduleValidation = [
  body('newDate')
    .isISO8601()
    .withMessage('New date must be a valid date'),
  body('newTimeSlot.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('newTimeSlot.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters')
];

const cancelValidation = [
  body('reason')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Reason must be between 5 and 200 characters'),
  body('cancelledBy')
    .isIn(['patient', 'staff', 'system'])
    .withMessage('Invalid cancelled by value')
];

const availabilityValidation = [
  query('date')
    .isISO8601()
    .withMessage('Date must be a valid date'),
  query('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  query('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  query('department')
    .optional()
    .isMongoId()
    .withMessage('Invalid department ID'),
  query('room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters')
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
    .isIn(['appointmentDate', 'patientName', 'type', 'status', 'priority', 'createdAt', 'updatedAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid appointment ID')
];

// Routes

// GET /api/appointments - Get all appointments with filtering and pagination
router.get('/', 
  queryValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist', 'technician']),
  getAppointments
);

// GET /api/appointments/stats - Get appointment statistics
router.get('/stats',
  authorize(['admin', 'lab_manager', 'receptionist']),
  getAppointmentStats
);

// GET /api/appointments/availability - Check appointment availability
router.get('/availability',
  availabilityValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist', 'technician']),
  checkAvailability
);

// GET /api/appointments/:id - Get single appointment
router.get('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist', 'technician']),
  getAppointment
);

// POST /api/appointments - Create new appointment
router.post('/',
  createAppointmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist']),
  createAppointment
);

// POST /api/appointments/:id/reschedule - Reschedule appointment
router.post('/:id/reschedule',
  idValidation,
  rescheduleValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist']),
  rescheduleAppointment
);

// POST /api/appointments/:id/cancel - Cancel appointment
router.post('/:id/cancel',
  idValidation,
  cancelValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist']),
  cancelAppointment
);

// POST /api/appointments/:id/checkin - Check in appointment
router.post('/:id/checkin',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist', 'technician']),
  checkInAppointment
);

// POST /api/appointments/:id/checkout - Check out appointment
router.post('/:id/checkout',
  idValidation,
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  validateRequest,
  authorize(['admin', 'lab_manager', 'technician']),
  checkOutAppointment
);

// PUT /api/appointments/:id - Update appointment
router.put('/:id',
  idValidation,
  updateAppointmentValidation,
  validateRequest,
  authorize(['admin', 'lab_manager', 'receptionist']),
  updateAppointment
);

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id',
  idValidation,
  validateRequest,
  authorize(['admin', 'lab_manager']),
  deleteAppointment
);

export default router;