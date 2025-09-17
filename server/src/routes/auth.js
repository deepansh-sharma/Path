import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyPassword, hashPassword } from "../utils/password.js";
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout,
  refreshToken,
  verifyEmail,
} from "../controllers/authController.js";
import {
  authenticate,
  authRateLimit,
  optionalAuth,
} from "../middleware/auth.js";

const router = Router();

// One-time super admin seed (protect in prod via secret or remove)
router.post("/seed-superadmin", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  const exists = await User.findOne({ role: "super_admin", email }).lean();
  if (exists)
    return res.status(409).json({ error: "Super admin already exists" });

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    name: name || "Super Admin",
    role: "super_admin",
    tenantId: "superadmin",
  });

  return res.status(201).json({ id: user._id });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email, isActive: true }).select(
    "+password"
  );
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role, tenantId: user.tenantId },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
  console.log({
    token,
    role: user.role,
    tenantId: user.tenantId,
    name: user.name,
    success: true,
  });
  return res.json({
    data: {
      token,
      role: user.role,
      tenantId: user.tenantId,
      name: user.name,
      success: true,
    },
  });
});

// New comprehensive authentication routes

// User registration
router.post("/register", authRateLimit(5, 15 * 60 * 1000), register);

// Enhanced login (keeping legacy for backward compatibility)
router.post("/login-v2", authRateLimit(5, 15 * 60 * 1000), login);

// Forgot password
router.post(
  "/forgot-password",
  authRateLimit(3, 15 * 60 * 1000),
  forgotPassword
);

// Reset password
router.post("/reset-password", authRateLimit(5, 15 * 60 * 1000), resetPassword);

// Verify email (if email verification is implemented)
router.get("/verify-email/:token", verifyEmail);

// Protected routes (authentication required)

// Get current user profile
router.get("/profile", authenticate, getProfile);

// Update user profile
router.put("/profile", authenticate, updateProfile);

// Change password
router.post("/change-password", authenticate, changePassword);

// Refresh token
router.post("/refresh-token", authenticate, refreshToken);

// Logout
router.post("/logout", optionalAuth, logout);

// Health check for auth service
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Get authentication status
router.get("/status", optionalAuth, (req, res) => {
  res.json({
    success: true,
    authenticated: !!req.user,
    user: req.user
      ? {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          labId: req.user.labId,
        }
      : null,
  });
});

export default router;
