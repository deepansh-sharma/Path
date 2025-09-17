import { Router } from "express";
import Invoice from "../models/Invoice.js";
import Patient from "../models/Patient.js";
import Sample from "../models/Sample.js";
import { authenticateJwt } from "../middleware/auth.js";
import { attachTenant, requireFeature } from "../middleware/tenant.js";
import { generateInvoiceNumber } from "../utils/invoice.js";
import { generatePdfPlaceholder } from "../utils/pdf.js";
import { logAction } from "../utils/logger.js";

const router = Router();

router.use(
  authenticateJwt,
  attachTenant,
  requireFeature("canInvoiceManagement")
);

router.post("/", async (req, res) => {
  const { patientId, sampleId, items, paymentMethod, status } = req.body || {};
  if (!patientId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "patientId and items required" });
  }
  const patient = await Patient.findOne({
    _id: patientId,
    tenantId: req.tenant.id,
  }).lean();
  if (!patient) return res.status(404).json({ error: "Patient not found" });
  if (sampleId) {
    const sample = await Sample.findOne({
      _id: sampleId,
      tenantId: req.tenant.id,
    }).lean();
    if (!sample) return res.status(404).json({ error: "Sample not found" });
  }
  const totalAmount = items.reduce(
    (sum, it) => sum + (Number(it.amount) || 0),
    0
  );
  const invoiceNumber = generateInvoiceNumber(req.tenant.id);
  const invoice = await Invoice.create({
    tenantId: req.tenant.id,
    patientId,
    sampleId: sampleId || undefined,
    items,
    totalAmount,
    paymentMethod: paymentMethod || "cash",
    status: status || "pending",
    invoiceNumber,
  });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "invoice_create",
    entity: "invoice",
    entityId: invoice._id.toString(),
    metadata: { totalAmount },
  });
  return res.status(201).json(invoice);
});

router.get("/", async (req, res) => {
  const invoices = await Invoice.find({ tenantId: req.tenant.id })
    .sort({ createdAt: -1 })
    .limit(100);
  return res.json(invoices);
});

router.post("/:id/pay", async (req, res) => {
  const { id } = req.params;
  const { paymentMethod } = req.body || {};
  const invoice = await Invoice.findOneAndUpdate(
    { _id: id, tenantId: req.tenant.id },
    { $set: { status: "paid", paymentMethod: paymentMethod || "cash" } },
    { new: true }
  );
  if (!invoice) return res.status(404).json({ error: "Not found" });
  // generate PDF placeholder on payment
  const pdfUrl = await generatePdfPlaceholder({
    type: "invoice",
    data: { invoiceId: id },
  });
  invoice.pdfUrl = pdfUrl;
  await invoice.save();
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "invoice_paid",
    entity: "invoice",
    entityId: id,
    metadata: { pdfUrl },
  });
  return res.json(invoice);
});

export default router;
