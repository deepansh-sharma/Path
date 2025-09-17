import { Router } from "express";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";
import { attachTenant } from "../middleware/tenant.js";
import Lab from "../models/Lab.js";

const router = Router();

router.use(
  authenticateJwt,
  requireRoles(["lab_admin", "super_admin"]),
  attachTenant
);

// Update branding and pricing templates (pricing not fully modeled; accept passthrough)
router.patch("/branding", async (req, res) => {
  const { logoUrl, reportHeaderText } = req.body || {};
  const lab = await Lab.findOneAndUpdate(
    { tenantId: req.tenant.id },
    { $set: { branding: { logoUrl, reportHeaderText } } },
    { new: true }
  ).lean();
  if (!lab) return res.status(404).json({ error: "Lab not found" });
  return res.json(lab.branding || {});
});

router.patch("/features", async (req, res) => {
  // Super admin may also update features using this route if needed
  const updates = req.body || {};
  const lab = await Lab.findOneAndUpdate(
    { tenantId: req.tenant.id },
    {
      $set: Object.fromEntries(
        Object.entries(updates).map(([k, v]) => ["features." + k, v])
      ),
    },
    { new: true }
  ).lean();
  if (!lab) return res.status(404).json({ error: "Lab not found" });
  return res.json(lab.features || {});
});

export default router;
