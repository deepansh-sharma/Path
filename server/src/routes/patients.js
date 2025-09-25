/**
 * @fileoverview Patient management routes
 * @description RESTful API endpoints for patient registration, retrieval, updates, and management
 * @version 1.0.0
 * @author Pathology SaaS Team
 */

import { Router } from "express";
import { 
  registerPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientStats
} from "../controllers/patientController.js";
import { authenticateJwt } from "../middleware/auth.js";
import { attachTenant, requireFeature } from "../middleware/tenant.js";
import { validatePatientRegistration, validatePatientUpdate } from "../middleware/validate.js";
import { 
  sanitizeBody, 
  sanitizeQuery, 
  sanitizeParams, 
  generalSanitization,
  patientRegistrationSchema 
} from "../middleware/sanitization.js";

const router = Router();

/**
 * @middleware Authentication and Authorization
 * @description Apply JWT authentication, tenant-based access control, and input sanitization to all patient routes
 * @requires Valid JWT token in Authorization header
 * @requires Lab tenant context
 * @requires Patient registration feature enabled for the lab
 * @security Input sanitization applied to prevent XSS and injection attacks
 */
router.use(
  generalSanitization,
  authenticateJwt,
  attachTenant,
  requireFeature("canPatientRegistration")
);

/**
 * @route   POST /api/patients/register
 * @desc    Register a new patient with comprehensive validation and sanitization
 * @access  Private (Lab Admin, Staff with patient registration permission)
 * @middleware sanitizeBody - Sanitizes input data to prevent XSS and injection attacks
 * @middleware validatePatientRegistration - Validates all patient data fields
 * @body    {Object} Patient registration data
 * @returns {Object} Success response with patient and invoice data
 * 
 * @example Request Body:
 * {
 *   "name": "John Doe",
 *   "phone": "1234567890",
 *   "email": "john@example.com",
 *   "age": 30,
 *   "gender": "male",
 *   "selectedTests": [{"id": "test1", "name": "Blood Test", "price": 500}]
 * }
 * 
 * @example Success Response (201):
 * {
 *   "success": true,
 *   "message": "Patient registered successfully",
 *   "data": {
 *     "patient": {...},
 *     "invoice": {...}
 *   }
 * }
 */
router.post(
  "/register", 
  sanitizeBody(patientRegistrationSchema),
  validatePatientRegistration, 
  registerPatient
);

/**
 * @route   GET /api/patients
 * @desc    Retrieve all patients with pagination, search, and filtering
 * @access  Private (Lab Admin, Staff with patient access permission)
 * @middleware sanitizeQuery - Sanitizes query parameters for secure filtering
 * @query   {number} page - Page number for pagination (default: 1)
 * @query   {number} limit - Number of records per page (default: 10, max: 100)
 * @query   {string} search - Search term for patient name, phone, or email
 * @query   {string} status - Filter by patient status
 * @query   {string} category - Filter by patient category
 * @query   {string} sortBy - Sort field (default: createdAt)
 * @query   {string} sortOrder - Sort order: asc or desc (default: desc)
 * @returns {Object} Paginated list of patients with metadata
 * 
 * @example Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "patients": [...],
 *     "pagination": {
 *       "currentPage": 1,
 *       "totalPages": 5,
 *       "totalRecords": 50,
 *       "hasNext": true,
 *       "hasPrev": false
 *     }
 *   }
 * }
 */
router.get(
  "/", 
  sanitizeQuery({
    page: { type: 'number', options: { min: 1, allowFloat: false } },
    limit: { type: 'number', options: { min: 1, max: 100, allowFloat: false } },
    search: { type: 'string', options: { maxLength: 100 } },
    status: { type: 'string', options: { maxLength: 50 } },
    category: { type: 'string', options: { maxLength: 50 } },
    sortBy: { type: 'string', options: { maxLength: 50 } },
    sortOrder: { type: 'string', options: { maxLength: 10 } }
  }),
  getAllPatients
);

/**
 * @route   GET /api/patients/search
 * @desc    Search patients with quick lookup functionality
 * @access  Private (Lab Admin, Staff with patient view permission)
 * @query   {string} q - Search query
 * @query   {number} limit - Maximum number of results (default: 20)
 * @returns {Object} Success response with matching patients
 * 
 * @example Query:
 * GET /api/patients/search?q=john&limit=10
 */
router.get("/search", searchPatients);

/**
 * @route   GET /api/patients/stats
 * @desc    Get patient statistics and analytics for dashboard
 * @access  Private (Lab Admin, Staff with analytics permission)
 * @query   {string} period - Time period for stats (today, week, month, year)
 * @returns {Object} Success response with patient statistics
 * 
 * @example Query:
 * GET /api/patients/stats?period=month
 */
router.get("/stats", getPatientStats);

/**
 * @route   GET /api/patients/:patientId
 * @desc    Retrieve a specific patient by ID with comprehensive details
 * @access  Private (Lab Admin, Staff with patient access permission)
 * @middleware sanitizeParams - Sanitizes URL parameters for security
 * @param   {string} patientId - MongoDB ObjectId of the patient
 * @returns {Object} Success response with patient details
 * 
 * @example Success Response (200):
 * {
 *   "success": true,
 *   "data": {
 *     "patient": {...},
 *     "meta": {
 *       "requestId": "req_123",
 *       "timestamp": "2024-01-15T10:30:00Z"
 *     }
 *   }
 * }
 * 
 * @example Error Response (404):
 * {
 *   "success": false,
 *   "message": "Patient not found",
 *   "code": "PATIENT_NOT_FOUND"
 * }
 */
router.get(
  "/:patientId", 
  sanitizeParams({
    patientId: { type: 'objectId', required: true }
  }),
  getPatientById
);

/**
 * @route   PUT /api/patients/:patientId
 * @desc    Update patient information with comprehensive validation and sanitization
 * @access  Private (Lab Admin, Staff with patient update permission)
 * @middleware sanitizeParams - Sanitizes URL parameters for security
 * @middleware sanitizeBody - Sanitizes request body to prevent XSS and injection attacks
 * @middleware validatePatientUpdate - Validates updated patient data
 * @param   {string} patientId - MongoDB ObjectId of the patient to update
 * @body    {Object} Updated patient data (partial update supported)
 * @returns {Object} Success response with updated patient data
 * 
 * @example Request Body:
 * {
 *   "phone": "9876543210",
 *   "email": "newemail@example.com",
 *   "address": {
 *     "city": "Updated City"
 *   }
 * }
 * 
 * @example Success Response (200):
 * {
 *   "success": true,
 *   "message": "Patient updated successfully",
 *   "data": {
 *     "patient": {...}
 *   }
 * }
 */
router.put(
  "/:patientId", 
  sanitizeParams({
    patientId: { type: 'objectId', required: true }
  }),
  sanitizeBody(patientRegistrationSchema),
  validatePatientUpdate, 
  updatePatient
);

/**
 * @route   DELETE /api/patients/:patientId
 * @desc    Delete a patient record (soft delete recommended)
 * @access  Private (Lab Admin only)
 * @middleware sanitizeParams - Sanitizes URL parameters for security
 * @param   {string} patientId - MongoDB ObjectId of the patient to delete
 * @returns {Object} Success response confirming deletion
 * 
 * @example Success Response (200):
 * {
 *   "success": true,
 *   "message": "Patient deleted successfully"
 * }
 * 
 * @example Error Response (404):
 * {
 *   "success": false,
 *   "message": "Patient not found",
 *   "code": "PATIENT_NOT_FOUND"
 * }
 */
router.delete(
  "/:patientId", 
  sanitizeParams({
    patientId: { type: 'objectId', required: true }
  }),
  deletePatient
);

export default router;
