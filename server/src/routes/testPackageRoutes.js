import express from "express";
import { body, param, query } from "express-validator";
import {
  getTestPackages,
  getTestPackage,
  createTestPackage,
  updateTestPackage,
  deleteTestPackage,
  addTestToPackage,
  removeTestFromPackage,
  updatePackagePricing,
  getPackageCategories,
  getPackageStats,
  togglePackageStatus,
  duplicatePackage,
  getPackageAnalytics,
} from "../controllers/testPackageController.js";
import { authenticate } from "../middleware/auth.js";
import { authorize } from "../middleware/rbac.js";

const router = express.Router();

// Validation schemas
const packageValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Package name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("category")
    .isIn([
      "Routine",
      "Preventive",
      "Diagnostic",
      "Specialized",
      "Emergency",
      "Wellness",
    ])
    .withMessage("Invalid package category"),
  body("tests")
    .isArray({ min: 2 })
    .withMessage("Package must contain at least 2 tests"),
  body("tests.*.testId").isMongoId().withMessage("Invalid test ID"),
  body("tests.*.isOptional")
    .optional()
    .isBoolean()
    .withMessage("isOptional must be a boolean"),
  body("pricing.packagePrice")
    .isFloat({ min: 0 })
    .withMessage("Package price must be a positive number"),
  body("pricing.currency")
    .optional()
    .isIn(["USD", "EUR", "INR", "GBP"])
    .withMessage("Invalid currency"),
  body("targetDemographics.ageRange.min")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("Minimum age must be between 0 and 150"),
  body("targetDemographics.ageRange.max")
    .optional()
    .isInt({ min: 0, max: 150 })
    .withMessage("Maximum age must be between 0 and 150"),
  body("targetDemographics.gender")
    .optional()
    .isIn(["male", "female", "both"])
    .withMessage("Invalid gender specification"),
  body("turnaroundTime.standard")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Standard turnaround time must be at least 1 hour"),
  body("turnaroundTime.urgent")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Urgent turnaround time must be at least 1 hour"),
  body("status")
    .optional()
    .isIn(["draft", "active", "inactive", "discontinued"])
    .withMessage("Invalid status"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const pricingValidation = [
  body("packagePrice")
    .isFloat({ min: 0 })
    .withMessage("Package price must be a positive number"),
  body("discount.type")
    .optional()
    .isIn(["percentage", "fixed"])
    .withMessage("Discount type must be percentage or fixed"),
  body("discount.value")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount value must be positive"),
  body("currency")
    .optional()
    .isIn(["USD", "EUR", "INR", "GBP"])
    .withMessage("Invalid currency"),
];

const addTestValidation = [
  body("testId").isMongoId().withMessage("Invalid test ID"),
  body("isOptional")
    .optional()
    .isBoolean()
    .withMessage("isOptional must be a boolean"),
  body("customPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Custom price must be positive"),
];

// Routes

// Get all test packages with filtering and pagination
router.get(
  "/",
  authenticate,
  authorize(["lab_admin", "staff"], ["view_tests", "manage_tests"]),
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category").optional().trim(),
    query("status")
      .optional()
      .isIn(["draft", "active", "inactive", "discontinued"]),
    query("isActive").optional().isBoolean(),
    query("search").optional().trim(),
    query("sortBy")
      .optional()
      .isIn(["name", "category", "packagePrice", "createdAt", "popularity"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("priceMin").optional().isFloat({ min: 0 }),
    query("priceMax").optional().isFloat({ min: 0 }),
  ],
  getTestPackages
);

// Get single test package
router.get(
  "/:id",
  authenticate,
  authorize(["lab_admin", "staff"], ["view_tests", "manage_tests"]),
  [param("id").isMongoId().withMessage("Invalid package ID")],
  getTestPackage
);

// Create new test package
router.post(
  "/",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  packageValidation,
  createTestPackage
);

// Update test package
router.put(
  "/:id",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    ...packageValidation,
  ],
  updateTestPackage
);

// Delete test package
router.delete(
  "/:id",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [param("id").isMongoId().withMessage("Invalid package ID")],
  deleteTestPackage
);

// Add test to package
router.post(
  "/:id/tests",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    ...addTestValidation,
  ],
  addTestToPackage
);

// Remove test from package
router.delete(
  "/:id/tests/:testId",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    param("testId").isMongoId().withMessage("Invalid test ID"),
  ],
  removeTestFromPackage
);

// Update package pricing
router.patch(
  "/:id/pricing",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    ...pricingValidation,
  ],
  updatePackagePricing
);

// Toggle package status
router.patch(
  "/:id/toggle-status",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    body("isActive")
      .optional()
      .isBoolean()
      .withMessage("isActive must be a boolean"),
  ],
  togglePackageStatus
);

// Duplicate package
router.post(
  "/:id/duplicate",
  authenticate,
  authorize(["lab_admin"], ["manage_tests"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("code").optional().trim().isLength({ min: 2, max: 20 }),
  ],
  duplicatePackage
);

// Get package categories
router.get(
  "/categories/list",
  authenticate,
  authorize(["lab_admin", "staff"], ["view_tests", "manage_tests"]),
  getPackageCategories
);

// Get package statistics
router.get(
  "/stats/overview",
  authenticate,
  authorize(["lab_admin"], ["view_reports"]),
  [
    query("dateFrom").optional().isISO8601().withMessage("Invalid date format"),
    query("dateTo").optional().isISO8601().withMessage("Invalid date format"),
  ],
  getPackageStats
);

// Get package analytics
router.get(
  "/:id/analytics",
  authenticate,
  authorize(["lab_admin"], ["view_reports"]),
  [
    param("id").isMongoId().withMessage("Invalid package ID"),
    query("dateFrom").optional().isISO8601().withMessage("Invalid date format"),
    query("dateTo").optional().isISO8601().withMessage("Invalid date format"),
  ],
  getPackageAnalytics
);

export default router;
