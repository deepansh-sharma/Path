import { Router } from "express";
import healthRouter from "./health.js";
import superAdminLabsRouter from "./superAdmin.labs.js";
import authRouter from "./auth.js";
import patientsRouter from "./patients.js";
import samplesRouter from "./samples.js";
import reportsRouter from "./reports.js";
import invoicesRouter from "./invoices.js";
import labUsersRouter from "./labAdmin.users.js";
import labConfigRouter from "./labAdmin.config.js";
import superAdminMetricsRouter from "./superAdmin.metrics.js";
// New feature routes
import inventoryRouter from "./inventory.js";
import equipmentRouter from "./equipment.js";
import appointmentRouter from "./appointment.js";
import auditRouter from "./audit.js";
import backupRouter from "./backup.js";
import testRouter from "./test.js";
import departmentRouter from "./department.js";
import usersRouter from "./users.js";

const router = Router();

router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/super-admin/labs", superAdminLabsRouter);
router.use("/super-admin/metrics", superAdminMetricsRouter);
router.use("/patients", patientsRouter);
router.use("/samples", samplesRouter);
router.use("/reports", reportsRouter);
router.use("/invoices", invoicesRouter);
router.use("/lab/users", labUsersRouter);
router.use("/lab/config", labConfigRouter);
// New feature routes
router.use("/inventory", inventoryRouter);
router.use("/equipment", equipmentRouter);
router.use("/appointments", appointmentRouter);
router.use("/audit", auditRouter);
router.use("/backup", backupRouter);
router.use("/tests", testRouter);
router.use("/departments", departmentRouter);
router.use("/users", usersRouter);

export default router;
