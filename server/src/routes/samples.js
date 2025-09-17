import { Router } from "express";
import Sample from "../models/Sample.js";
import Patient from "../models/Patient.js";
import { authenticateJwt } from "../middleware/auth.js";
import { attachTenant, requireFeature } from "../middleware/tenant.js";
import { generateSampleBarcode } from "../utils/barcode.js";
import { logAction } from "../utils/logger.js";

const router = Router();

router.use(
  authenticateJwt,
  attachTenant,
  requireFeature("canSampleBarcodeTracking")
);

router.post("/", async (req, res) => {
  const { patientId, testCode } = req.body || {};
  if (!patientId || !testCode)
    return res.status(400).json({ error: "patientId and testCode required" });
  const exists = await Patient.findOne({
    _id: patientId,
    tenantId: req.tenant.id,
  }).lean();
  if (!exists) return res.status(404).json({ error: "Patient not found" });
  const barcode = generateSampleBarcode({ patientId, testCode });
  const sample = await Sample.create({
    tenantId: req.tenant.id,
    patientId,
    testCode,
    barcode,
    timestampsLog: [{ status: "collected", at: new Date() }],
  });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "sample_create",
    entity: "sample",
    entityId: sample._id.toString(),
    metadata: { barcode },
  });
  return res.status(201).json(sample);
});

router.get("/", async (req, res) => {
  const samples = await Sample.find({ tenantId: req.tenant.id })
    .sort({ createdAt: -1 })
    .limit(100);
  return res.json(samples);
});

router.post("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const allowed = [
    "collected",
    "in_lab",
    "processing",
    "report_ready",
    "approved",
  ];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const sample = await Sample.findOneAndUpdate(
    { _id: id, tenantId: req.tenant.id },
    { $set: { status }, $push: { timestampsLog: { status, at: new Date() } } },
    { new: true }
  );
  if (!sample) return res.status(404).json({ error: "Not found" });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "sample_status",
    entity: "sample",
    entityId: id,
    metadata: { status },
  });
  return res.json(sample);
});

export default router;
