import { Router } from "express";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";
import Lab from "../models/Lab.js";
import Patient from "../models/Patient.js";
import Report from "../models/Report.js";
import Invoice from "../models/Invoice.js";

const router = Router();

router.use(authenticateJwt, requireRoles(["super_admin"]));

router.get("/overview", async (req, res) => {
  const totalLabs = await Lab.countDocuments({});
  const activeLabs = await Lab.countDocuments({
    "subscription.isActive": true,
  });
  const inactiveLabs = totalLabs - activeLabs;
  const perLabCounts = await Lab.find()
    .select("tenantId name subscription.isActive")
    .lean();
  const metrics = [];
  for (const lab of perLabCounts) {
    const patients = await Patient.countDocuments({ tenantId: lab.tenantId });
    const reports = await Report.countDocuments({ tenantId: lab.tenantId });
    const invoices = await Invoice.countDocuments({ tenantId: lab.tenantId });
    const revenue = await Invoice.aggregate([
      { $match: { tenantId: lab.tenantId, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    metrics.push({
      tenantId: lab.tenantId,
      name: lab.name,
      isActive: lab.subscription?.isActive,
      patients,
      reports,
      invoices,
      revenue: revenue[0]?.total || 0,
    });
  }
  return res.json({ totalLabs, activeLabs, inactiveLabs, metrics });
});

export default router;
