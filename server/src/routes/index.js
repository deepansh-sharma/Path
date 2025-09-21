import { Router } from "express";

// --- Import Routers ---

// Core & Authentication
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import exportRouter from "./export.js"; // Keep the export router separate

// Super Admin Routers
import superAdminLabsRouter from "./superAdmin.labs.js";
import superAdminMetricsRouter from "./superAdmin.metrics.js";

// Lab-Specific Routers (for a specific lab context)
import dashboardRouter from "./dashboard.js";
import patientsRouter from "./patients.js";
import samplesRouter from "./samples.js";
import reportsRouter from "./reports.js";
import invoicesRouter from "./invoices.js";
import labUsersRouter from "./labAdmin.users.js";
import labConfigRouter from "./labAdmin.config.js";
import inventoryRouter from "./inventory.js";
import equipmentRouter from "./equipment.js";
import appointmentRouter from "./appointment.js";
import auditRouter from "./audit.js";
import backupRouter from "./backup.js";
import testRouter from "./test.js";
import departmentRouter from "./department.js";
import staffRouter from "./staff.js";
// Note: 'usersRouter', 'labRouter' seem generic or redundant, consider merging them.

const mainRouter = Router();

// --- Top-Level Routes (Global) ---
mainRouter.use("/health", healthRouter);
mainRouter.use("/auth", authRouter);

// --- Super Admin Master Route ---
// All super-admin routes are now cleanly grouped under /api/super-admin
const superAdminRouter = Router();
superAdminRouter.use("/labs", superAdminLabsRouter);
superAdminRouter.use("/metrics", superAdminMetricsRouter);
// Note: We are using the dashboardRouter here for the super-admin dashboard part
superAdminRouter.use("/dashboard", dashboardRouter);
// The export route is now properly namespaced
superAdminRouter.use("/export", exportRouter);
mainRouter.use("/super-admin", superAdminRouter);

// --- Lab-Specific Master Route ---
// All routes that operate within a specific lab are grouped here.
// This enforces a consistent, tenant-based URL structure.
const labRouter = Router({ mergeParams: true }); // 'mergeParams' is crucial for accessing :labId
labRouter.use("/dashboard", dashboardRouter);
labRouter.use("/patients", patientsRouter);
labRouter.use("/samples", samplesRouter);
labRouter.use("/reports", reportsRouter);
labRouter.use("/invoices", invoicesRouter);
labRouter.use("/users", labUsersRouter);
labRouter.use("/config", labConfigRouter);
labRouter.use("/inventory", inventoryRouter);
labRouter.use("/equipment", equipmentRouter);
labRouter.use("/appointments", appointmentRouter);
labRouter.use("/audit", auditRouter);
labRouter.use("/backup", backupRouter);
labRouter.use("/tests", testRouter);
labRouter.use("/departments", departmentRouter);
labRouter.use("/staff", staffRouter);
// Mount the lab-specific router with a labId parameter
mainRouter.use("/lab/:labId", labRouter);

export default mainRouter;
