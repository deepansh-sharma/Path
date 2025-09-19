import express from "express";
import { exportLabsAsCSV } from "../controllers/exportController.js";
import { authenticate as protect, isSuperAdmin } from "../middleware/auth.js";

const router = express.Router();

// Defines the route for exporting labs as a CSV file
router.get("/labs", protect, isSuperAdmin, exportLabsAsCSV);

// This line is essential for the import to work correctly
export default router;
