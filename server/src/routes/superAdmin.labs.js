import { Router } from "express";
import crypto from "crypto";
import Lab from "../models/Lab.js";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";

const router = Router();

router.use(authenticateJwt, requireRoles(["super_admin"]));

// Create/register new lab (tenant)
router.post("/", async (req, res) => {
  const {
    name,
    ownerName,
    email,
    contact,
    address,
    plan,
    features,
    subscription,
  } = req.body || {};

  if (!name || !ownerName || !email)
    return res.status(400).json({ error: "Missing required fields" });

  const tenantId = `lab_${crypto.randomUUID()}`;
  const lab = await Lab.create({
    name,
    ownerName,
    email,
    contact,
    address,
    tenantId,
    subscription: {
      plan: plan || subscription?.plan || "basic",
      isActive: subscription?.isActive ?? true,
      startDate: subscription?.startDate || new Date(),
      endDate: subscription?.endDate || null,
      paymentStatus: subscription?.paymentStatus || "pending",
    },
    features: features || undefined,
  });

  return res.status(201).json(lab);
});

// List labs with basic usage placeholders (real metrics to be added later)
router.get("/", async (req, res) => {
  console.log("[Backend] GET /super-admin/labs called");
  try {
    const labs = await Lab.find().sort({ createdAt: -1 }).lean();
    console.log("[Backend] Labs response:", labs);
    return res.json(labs);
  } catch (err) {
    console.log("[Backend] Error in /super-admin/labs:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update lab subscription/features/branding
router.patch("/:tenantId", async (req, res) => {
  const { tenantId } = req.params;
  const updates = req.body || {};
  const lab = await Lab.findOneAndUpdate({ tenantId }, updates, {
    new: true,
  }).lean();
  if (!lab) return res.status(404).json({ error: "Lab not found" });
  return res.json(lab);
});

// Activate/Deactivate lab
router.post("/:tenantId/license", async (req, res) => {
  const { tenantId } = req.params;
  const { isActive } = req.body || {};
  const lab = await Lab.findOneAndUpdate(
    { tenantId },
    { $set: { "subscription.isActive": !!isActive } },
    { new: true }
  ).lean();
  if (!lab) return res.status(404).json({ error: "Lab not found" });
  return res.json(lab);
});

export default router;
