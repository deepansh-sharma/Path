import { Router } from "express";
import Report from "../models/Report.js";
import Sample from "../models/Sample.js";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";
import { attachTenant, requireFeature } from "../middleware/tenant.js";
import { logAction } from "../utils/logger.js";
import { generatePdfPlaceholder } from "../utils/pdf.js";
import { sendWhatsAppMessage, sendEmail } from "../utils/messaging.js";

const router = Router();

router.use(
  authenticateJwt,
  attachTenant,
  requireFeature("canDoctorReviewWorkflow")
);

// Create or update draft report
router.post("/", async (req, res) => {
  const data = req.body || {};
  const sample = await Sample.findOne({
    _id: data.sampleId,
    tenantId: req.tenant.id,
  }).lean();
  if (!sample) return res.status(404).json({ error: "Sample not found" });
  const report = await Report.create({
    ...data,
    tenantId: req.tenant.id,
    status: "draft",
  });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "report_create",
    entity: "report",
    entityId: report._id.toString(),
  });
  return res.status(201).json(report);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const report = await Report.findOne({ _id: id, tenantId: req.tenant.id });
  if (!report) return res.status(404).json({ error: "Not found" });
  if (report.locked) return res.status(400).json({ error: "Report locked" });
  Object.assign(report, updates);
  await report.save();
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "report_update",
    entity: "report",
    entityId: id,
    metadata: updates,
  });
  return res.json(report);
});

// Submit for review
router.post("/:id/submit", async (req, res) => {
  const { id } = req.params;
  const report = await Report.findOneAndUpdate(
    { _id: id, tenantId: req.tenant.id, locked: { $ne: true } },
    { $set: { status: "pending_review" } },
    { new: true }
  );
  if (!report) return res.status(404).json({ error: "Not found" });
  logAction({
    tenantId: req.tenant.id,
    userId: req.user.userId,
    action: "report_submit",
    entity: "report",
    entityId: id,
  });
  return res.json(report);
});

// Approve (doctor only) and lock
router.post(
  "/:id/approve",
  requireRoles(["doctor", "lab_admin", "super_admin"]),
  async (req, res) => {
    const { id } = req.params;
    const report = await Report.findOneAndUpdate(
      { _id: id, tenantId: req.tenant.id },
      {
        $set: {
          status: "approved",
          locked: true,
          approvedAt: new Date(),
          doctorId: req.user.userId,
        },
      },
      { new: true }
    );
    if (!report) return res.status(404).json({ error: "Not found" });
    // generate PDF placeholder
    const pdfUrl = await generatePdfPlaceholder({
      type: "report",
      data: { reportId: id },
    });
    report.pdfUrl = pdfUrl;
    await report.save();
    logAction({
      tenantId: req.tenant.id,
      userId: req.user.userId,
      action: "report_approve",
      entity: "report",
      entityId: id,
      metadata: { pdfUrl },
    });
    // optional messaging (placeholder)
    const { sendWhatsapp, sendEmail: sendMail, phone, email } = req.body || {};
    if (sendWhatsapp && phone) {
      await sendWhatsAppMessage({
        to: phone,
        message: "Your report is ready",
        mediaUrl: pdfUrl,
      });
    }
    if (sendMail && email) {
      await sendEmail({
        to: email,
        subject: "Report Ready",
        text: "Your report is attached",
        html: `<p>Your report is ready</p>`,
        attachments: [{ filename: "report.pdf", path: pdfUrl }],
      });
    }
    return res.json(report);
  }
);

router.get("/", async (req, res) => {
  const { status } = req.query;
  const filter = { tenantId: req.tenant.id };
  if (status) filter.status = status;
  const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(50);
  return res.json(reports);
});

export default router;
