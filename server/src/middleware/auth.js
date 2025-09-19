import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Lab from "../models/Lab.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Generate JWT token
export const generateToken = (userId, labId = null) => {
  return jwt.sign(
    {
      userId,
      labId,
      timestamp: Date.now(),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token required",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    // Find user and populate lab information
    const user = await User.findById(decoded.userId)
      .populate("labId", "name subscription.plan subscription.status")
      .select("-passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Check if lab subscription is active (except for super admin)
    if (user.role !== "super_admin" && user.labId) {
      const lab = await Lab.findById(user.labId);
      if (!lab || lab.subscription.status !== "active") {
        return res.status(403).json({
          success: false,
          message: "Lab subscription is not active",
        });
      }
    }

    // Update last login
    await user.updateLastLogin();

    req.user = user;
    req.labId = user.labId;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Legacy authentication for backward compatibility
export async function authenticateJwt(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);

    // Fetch the full user data to get role and other info
    const user = await User.findById(payload.userId)
      .populate("labId", "name subscription.plan subscription.status tenantId")
      .select("-passwordHash");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Set user data with role and tenantId for legacy compatibility
    req.user = {
      userId: user._id,
      role: user.role,
      tenantId: user.labId?.tenantId || user.tenantId || "superadmin",
      ...user.toObject(),
    };

    return next();
  } catch (error) {
    console.error("JWT Auth error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Role-based authorization middleware
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
      });
    }

    next();
  };
};

// Legacy role check for backward compatibility
export function requireRoles(roles) {
  return function (req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  };
}

// Permission-based authorization middleware
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`,
      });
    }

    next();
  };
};

// Lab ownership middleware - ensures user belongs to the lab
export const requireLabAccess = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Super admin can access any lab
    if (req.user.role === "super_admin") {
      return next();
    }

    const labId = req.params.labId || req.body.labId || req.query.labId;

    if (!labId) {
      return res.status(400).json({
        success: false,
        message: "Lab ID required",
      });
    }

    // Check if user belongs to the requested lab
    if (req.user.labId.toString() !== labId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this lab",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error checking lab access",
      error: error.message,
    });
  }
};

// Multi-tenant middleware - adds lab filter to queries
export const addLabFilter = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Super admin can access all data
  if (req.user.role === "super_admin") {
    return next();
  }

  // Add lab filter for other users
  req.labFilter = { labId: req.user.labId };
  next();
};

// Rate limiting middleware for authentication endpoints
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.body.email || req.body.phone || "");
    const now = Date.now();

    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempt = attempts.get(key);

    if (now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (attempt.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: "Too many authentication attempts. Please try again later.",
        retryAfter: Math.ceil((attempt.resetTime - now) / 1000),
      });
    }

    attempt.count++;
    next();
  };
};

// Subscription feature check middleware
export const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Super admin has access to all features
      if (req.user.role === "super_admin") {
        return next();
      }

      const lab = await Lab.findById(req.user.labId);
      if (!lab) {
        return res.status(404).json({
          success: false,
          message: "Lab not found",
        });
      }

      if (!lab.hasFeature(featureName)) {
        return res.status(403).json({
          success: false,
          message: `Feature '${featureName}' not available in your subscription plan`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking feature access",
        error: error.message,
      });
    }
  };
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId)
      .populate("labId", "name subscription.plan subscription.status")
      .select("-passwordHash");

    if (user && user.isActive) {
      req.user = user;
      req.labId = user.labId;
    }

    next();
  } catch (error) {
    // Ignore token errors for optional auth
    next();
  }
};

export const isSuperAdmin = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "super_admin" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Super admin access required.",
    });
  }
};

export default {
  generateToken,
  verifyToken,
  authenticate,
  authorize,
  requirePermission,
  requireLabAccess,
  addLabFilter,
  authRateLimit,
  requireFeature,
  optionalAuth,
  isSuperAdmin,
  // Legacy exports
  authenticateJwt,
  requireRoles,
};
