import { Router } from "express";
import {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
  getLabSettings,
  updateLabSettings,
} from "../controllers/labController.js";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";
import { rbac } from "../middleware/rbac.js";
import { validateLab } from "../middleware/validate.js";

const router = Router();

// Lab management routes (Super Admin only)
// router.get("/", authenticate, rbac(["super_admin"]), getAllLabs);
// router.get(
//   "/:id",
//   authenticate,
//   rbac(["super_admin", "lab_admin"]),
//   getLabById
// );
// router.post("/", authenticate, rbac(["super_admin"]), validateLab, createLab);
// router.put("/:id", authenticate, rbac(["super_admin"]), validateLab, updateLab);
// router.delete("/:id", authenticate, rbac(["super_admin"]), deleteLab);

// Lab settings routes (Lab Admin)
console.log("Lab routes loaded : authentication middleware");
router.use(authenticateJwt, requireRoles(["lab_admin"]));
console.log("Lab routes loaded : lab/:id middleware");
router.get("lab/:id", getLabById);
router.get("/:id/settings", getLabSettings);
router.put("/:id/settings", updateLabSettings);

// Lab statistics
router.get(
  "/:id/stats",
  authenticateJwt,
  rbac(["super_admin", "lab_admin"]),
  (req, res) => {
    res.json({
      success: true,
      message: "Lab statistics endpoint - implementation pending",
      data: {},
    });
  }
);

export default router;
