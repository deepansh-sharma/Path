import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { getLabDashboardData } from "../controllers/labController.js"; // Renamed for clarity
import { getSuperAdminDashboardData } from "../controllers/dashboardController.js"; // Renamed for clarity

const router = Router();

// Single route for all Super Admin dashboard data
router.get(
  "/super-admin",
  authenticate,
  rbac(["super_admin"]),
  getSuperAdminDashboardData
);

// Single, consistent route for all Lab Admin dashboard data
router.get(
  "/lab/:labId",
  authenticate,
  rbac(["lab_admin", "super_admin"]),
  getLabDashboardData
);

export default router;
