import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { getDashboardData } from "../controllers/labController.js";
import {
  getSuperAdminDashboard,
  getSuperAdminStats,
} from "../controllers/dashboardController.js";

const router = Router();

// Super Admin Dashboard Routes
router.get(
  "/super-admin",
  authenticate,
  rbac(["super_admin"]),
  getSuperAdminDashboard
);
router.get(
  "/super-admin/stats",
  authenticate,
  rbac(["super_admin"]),
  getSuperAdminStats
);
router.get(
  "/super-admin/metrics",
  authenticate,
  rbac(["super_admin"]),
  getSuperAdminStats
);

// Lab Admin Dashboard Routes
console.log("Lab Admin Dashboard Routes");
router.get(
  "/lab-admin/:labId",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/stats",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/revenue",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/patient-growth",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/test-status",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/activities",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab-admin/:labId/alerts",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);

// Keep original lab routes for backward compatibility
router.get(
  "/lab/:labId",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/stats",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/revenue",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/patient-growth",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/test-status",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/activities",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/lab/:labId/alerts",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);

// Analytics Routes
router.get(
  "/analytics/lab/:labId/revenue",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/analytics/lab/:labId/performance",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);
router.get(
  "/analytics/lab/:labId/staff-performance",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getDashboardData
);

export default router;
