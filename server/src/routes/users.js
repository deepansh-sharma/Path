import express from "express";
import { body, query, param } from "express-validator";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  getUserActivity,
  bulkUpdateUsers,
  exportUsers,
} from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validateRequest } from "../middleware/validation.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation rules
const createUserValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
    ),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
  body("role")
    .isIn([
      "admin",
      "lab_manager",
      "technician",
      "receptionist",
      "doctor",
      "staff",
      "inventory_manager",
      "hr_manager",
    ])
    .withMessage("Invalid role"),
  body("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array"),
];

const updateUserValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),
  body("email")
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
  body("role")
    .optional()
    .isIn([
      "admin",
      "lab_manager",
      "technician",
      "receptionist",
      "doctor",
      "staff",
      "inventory_manager",
      "hr_manager",
    ])
    .withMessage("Invalid role"),
  body("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),
  body("permissions")
    .optional()
    .isArray()
    .withMessage("Permissions must be an array"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const queryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Search term must be between 1 and 100 characters"),
  query("role")
    .optional()
    .isIn([
      "admin",
      "lab_manager",
      "technician",
      "receptionist",
      "doctor",
      "staff",
      "inventory_manager",
      "hr_manager",
    ])
    .withMessage("Invalid role filter"),
  query("department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),
  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  query("sortBy")
    .optional()
    .isIn([
      "name",
      "email",
      "role",
      "department",
      "isActive",
      "lastLogin",
      "createdAt",
      "updatedAt",
    ])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  query("dateFrom")
    .optional()
    .isISO8601()
    .withMessage("dateFrom must be a valid date"),
  query("dateTo")
    .optional()
    .isISO8601()
    .withMessage("dateTo must be a valid date"),
];

const bulkUpdateValidation = [
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("userIds must be a non-empty array"),
  body("userIds.*").isMongoId().withMessage("Each user ID must be valid"),
  body("updates").isObject().withMessage("Updates must be an object"),
  body("updates.role")
    .optional()
    .isIn([
      "admin",
      "lab_manager",
      "technician",
      "receptionist",
      "doctor",
      "staff",
      "inventory_manager",
      "hr_manager",
    ])
    .withMessage("Invalid role"),
  body("updates.isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("updates.department")
    .optional()
    .isMongoId()
    .withMessage("Invalid department ID"),
];

const exportValidation = [
  query("format")
    .optional()
    .isIn(["json", "csv", "xlsx"])
    .withMessage("Format must be json, csv, or xlsx"),
  query("fields").optional().isArray().withMessage("Fields must be an array"),
];

const idValidation = [param("id").isMongoId().withMessage("Invalid user ID")];

// Routes

// GET /api/users - Get all users with advanced filtering and search
router.get(
  "/",
  queryValidation,
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  getUsers
);

// GET /api/users/stats - Get user statistics
router.get(
  "/stats",
  authorize(["admin", "lab_manager", "hr_manager"]),
  getUserStats
);

// GET /api/users/export - Export users data
router.get(
  "/export",
  exportValidation,
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  exportUsers
);

// GET /api/users/:id - Get single user
router.get(
  "/:id",
  idValidation,
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  getUser
);

// GET /api/users/:id/activity - Get user activity logs
router.get(
  "/:id/activity",
  idValidation,
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  getUserActivity
);

// POST /api/users - Create new user
router.post(
  "/",
  createUserValidation,
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  createUser
);

// PUT /api/users/:id - Update user
router.put(
  "/:id",
  idValidation,
  updateUserValidation,
  validateRequest,
  authorize(["admin", "lab_manager", "hr_manager"]),
  updateUser
);

// PATCH /api/users/bulk - Bulk update users
router.patch(
  "/bulk",
  bulkUpdateValidation,
  validateRequest,
  authorize(["admin", "lab_manager"]),
  bulkUpdateUsers
);

// DELETE /api/users/:id - Delete user (soft delete)
router.delete(
  "/:id",
  idValidation,
  validateRequest,
  authorize(["admin", "lab_manager"]),
  deleteUser
);

export default router;
