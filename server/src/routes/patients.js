import { Router } from "express";
import Patient from "../models/Patient.js";
import { authenticateJwt } from "../middleware/auth.js";
import { attachTenant, requireFeature } from "../middleware/tenant.js";
import { logAction } from "../utils/logger.js";

const router = Router();

router.use(
  authenticateJwt,
  attachTenant,
  requireFeature("canPatientRegistration")
);

router.post("/", async (req, res) => {
  const data = req.body || {};
  const patient = await Patient.create({ ...data, tenantId: req.tenant.id });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "patient_create",
    entity: "patient",
    entityId: patient._id.toString(),
  });
  return res.status(201).json(patient);
});

router.get("/", async (req, res) => {
  const { q } = req.query;
  const filter = { tenantId: req.tenant.id };
  const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
  const skip = Math.max(parseInt(req.query.skip || "0", 10), 0);
  if (q) {
    filter.$or = [
      { firstName: new RegExp(q, "i") },
      { lastName: new RegExp(q, "i") },
      { phone: new RegExp(q, "i") },
    ];
  }
  const patients = await Patient.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res.json(patients);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const patient = await Patient.findOne({ _id: id, tenantId: req.tenant.id });
  if (!patient) return res.status(404).json({ error: "Not found" });
  return res.json(patient);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const patient = await Patient.findOneAndUpdate(
    { _id: id, tenantId: req.tenant.id },
    updates,
    { new: true }
  );
  if (!patient) return res.status(404).json({ error: "Not found" });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "patient_update",
    entity: "patient",
    entityId: id,
    metadata: updates,
  });
  return res.json(patient);
});

export default router;
