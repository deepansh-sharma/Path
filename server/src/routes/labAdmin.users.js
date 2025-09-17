import { Router } from "express";
import User from "../models/User.js";
import { authenticateJwt, requireRoles } from "../middleware/auth.js";
import { attachTenant } from "../middleware/tenant.js";
import { hashPassword } from "../utils/password.js";

const router = Router();

router.use(
  authenticateJwt,
  requireRoles(["lab_admin", "super_admin"]),
  attachTenant
);

router.post("/", async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password || !role)
    return res.status(400).json({ error: "Missing fields" });
  if (!["doctor", "staff", "lab_admin"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    tenantId: req.tenant.id,
  });
  return res.status(201).json({ id: user._id });
});

router.get("/", async (req, res) => {
  const users = await User.find({
    tenantId: req.tenant.id,
    role: { $ne: "super_admin" },
  })
    .select("name email role isActive createdAt")
    .sort({ createdAt: -1 })
    .lean();
  return res.json(users);
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  if (updates.password) {
    updates.passwordHash = await hashPassword(updates.password);
    delete updates.password;
  }
  const user = await User.findOneAndUpdate(
    { _id: id, tenantId: req.tenant.id },
    updates,
    { new: true }
  )
    .select("name email role isActive")
    .lean();
  if (!user) return res.status(404).json({ error: "Not found" });
  return res.json(user);
});

export default router;
