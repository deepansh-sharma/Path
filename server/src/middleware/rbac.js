/**
 * Role-Based Access Control (RBAC) Middleware
 * Handles authorization based on user roles and permissions
 */

// Define role hierarchy and permissions
const ROLE_HIERARCHY = {
  super_admin: 4,
  lab_admin: 3,
  technician: 2,
  receptionist: 2,
  finance: 2,
  staff: 2,
  patient: 1,
};

const ROLE_PERMISSIONS = {
  super_admin: [
    "manage_labs",
    "manage_subscriptions",
    "view_all_data",
    "manage_users",
    "system_settings",
  ],
  lab_admin: [
    "manage_lab_staff",
    "manage_patients",
    "manage_reports",
    "manage_invoices",
    "manage_samples",
    "view_lab_analytics",
    "lab_settings",
    "manage_staff",
    "manage_tests",
    "view_analytics",
  ],
  technician: ["manage_tests", "update_test_results", "view_patients"],
  receptionist: ["manage_patients", "manage_appointments", "view_tests"],
  finance: ["manage_invoices", "view_payments", "view_analytics"],
  staff: [
    "view_patients",
    "create_reports",
    "update_reports",
    "manage_samples",
    "view_invoices",
    "view_assigned_tasks",
  ],
  patient: ["view_own_reports", "view_own_invoices", "update_profile"],
};

/**
 * RBAC middleware factory function
 * @param {Array} allowedRoles - Array of roles that can access the route
 * @param {Array} requiredPermissions - Optional array of specific permissions required
 * @returns {Function} Express middleware function
 */
export const rbac = (allowedRoles = [], requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      console.log("🔐 RBAC Middleware - Starting authorization check");
      console.log(`📋 Required roles: ${allowedRoles.join(", ")}`);
      console.log(`🔑 Required permissions: ${requiredPermissions.join(", ")}`);

      // Check if user is authenticated (should be set by auth middleware)
      if (!req.user) {
        console.log(
          "❌ RBAC Error: No user found in request - authentication required"
        );
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "User not authenticated",
        });
      }

      const userRole = req.user.role;
      const userId = req.user._id;
      const labId = req.user.labId;

      console.log(
        `👤 User Info - ID: ${userId}, Role: ${userRole}, Lab: ${labId}`
      );

      // Validate user role exists
      if (!userRole || !ROLE_HIERARCHY.hasOwnProperty(userRole)) {
        console.log(`❌ RBAC Error: Invalid user role: ${userRole}`);
        return res.status(403).json({
          success: false,
          message: "Invalid user role",
          error: `Role '${userRole}' is not recognized`,
        });
      }

      // Check if user role is in allowed roles
      const hasRequiredRole =
        allowedRoles.length === 0 || allowedRoles.includes(userRole);

      if (!hasRequiredRole) {
        console.log(`❌ RBAC Error: Insufficient role permissions`);
        console.log(
          `   User role: ${userRole} (level ${ROLE_HIERARCHY[userRole]})`
        );
        console.log(`   Required roles: ${allowedRoles.join(", ")}`);

        return res.status(403).json({
          success: false,
          message: "Insufficient permissions",
          error: `Role '${userRole}' is not authorized for this action`,
        });
      }

      // Check specific permissions if required
      if (requiredPermissions.length > 0) {
        const userPermissions = ROLE_PERMISSIONS[userRole] || [];
        const hasAllPermissions = requiredPermissions.every((permission) =>
          userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
          const missingPermissions = requiredPermissions.filter(
            (permission) => !userPermissions.includes(permission)
          );

          console.log(
            `❌ RBAC Error: Missing permissions: ${missingPermissions.join(
              ", "
            )}`
          );
          console.log(`   User permissions: ${userPermissions.join(", ")}`);

          return res.status(403).json({
            success: false,
            message: "Insufficient permissions",
            error: `Missing required permissions: ${missingPermissions.join(
              ", "
            )}`,
          });
        }
      }

      // Additional lab-specific authorization for non-super-admin users
      if (userRole !== "super_admin" && req.params.labId) {
        const requestedLabId = req.params.labId;

        // Ensure user can only access their own lab's data
        if (labId && labId._id && labId._id.toString() !== requestedLabId) {
          console.log(`❌ RBAC Error: Lab access denied`);
          console.log(`   User's lab ID: ${labId._id.toString()}`); // Correctly log the ID
          console.log(`   Requested lab ID: ${requestedLabId}`);

          return res.status(403).json({
            success: false,
            message: "Access denied to requested lab",
            error: "You can only access data from your own laboratory",
          });
        }
      }

      // Log successful authorization
      console.log("✅ RBAC Success: User authorized for this action");
      console.log(`   Role: ${userRole} (level ${ROLE_HIERARCHY[userRole]})`);
      console.log(
        `   Permissions: ${ROLE_PERMISSIONS[userRole]?.join(", ") || "None"}`
      );

      // Add role and permissions to request for use in controllers
      req.userRole = userRole;
      req.userPermissions = ROLE_PERMISSIONS[userRole] || [];
      req.roleLevel = ROLE_HIERARCHY[userRole];

      next();
    } catch (error) {
      console.error("💥 RBAC Middleware Error:", error);
      console.error("Stack trace:", error.stack);

      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };
};

/**
 * Check if user has specific permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (userRole, permission) => {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes(permission);
};

/**
 * Check if user role has higher or equal level than required role
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean} True if user role is sufficient
 */
export const hasRoleLevel = (userRole, requiredRole) => {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
};

/**
 * Middleware to check if user owns the resource or has admin privileges
 * Useful for routes where users should only access their own data
 */
export const ownerOrAdmin = (resourceUserIdField = "userId") => {
  return async (req, res, next) => {
    try {
      console.log("🔒 Owner/Admin Check - Verifying resource ownership");

      const currentUserId = req.user._id.toString();
      const resourceUserId =
        req.params[resourceUserIdField] || req.body[resourceUserIdField];
      const userRole = req.user.role;

      console.log(`👤 Current user: ${currentUserId}, Role: ${userRole}`);
      console.log(`📄 Resource user: ${resourceUserId}`);

      // Super admin and lab admin can access any resource
      if (userRole === "super_admin" || userRole === "lab_admin") {
        console.log("✅ Admin access granted");
        return next();
      }

      // Check if user owns the resource
      if (currentUserId === resourceUserId) {
        console.log("✅ Owner access granted");
        return next();
      }

      console.log("❌ Access denied: Not owner or admin");
      return res.status(403).json({
        success: false,
        message: "Access denied",
        error: "You can only access your own resources",
      });
    } catch (error) {
      console.error("💥 Owner/Admin Check Error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization check failed",
        error:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
    }
  };
};

// Export default rbac function for backward compatibility
export default rbac;

/**
 * Test-specific RBAC middleware
 * Handles test management permissions with granular control
 */
export const testRBAC = (action) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const labId = req.user.labId;

    // Define test-specific permissions for each role
    const testPermissions = {
      super_admin: {
        read: true,
        create: true,
        update: true,
        delete: true,
        approve: true,
        bulk_operations: true,
        export: true,
        import: true,
        manage_templates: true,
        view_history: true,
        quality_control: true,
        manage_pricing: true
      },
      lab_admin: {
        read: true,
        create: true,
        update: true,
        delete: true,
        approve: true,
        bulk_operations: true,
        export: true,
        import: true,
        manage_templates: true,
        view_history: true,
        quality_control: true,
        manage_pricing: true
      },
      technician: {
        read: true,
        create: false,
        update: false,
        delete: false,
        approve: false,
        bulk_operations: false,
        export: false,
        import: false,
        manage_templates: false,
        view_history: false,
        quality_control: true,
        manage_pricing: false
      },
      receptionist: {
        read: true,
        create: false,
        update: false,
        delete: false,
        approve: false,
        bulk_operations: false,
        export: false,
        import: false,
        manage_templates: false,
        view_history: false,
        quality_control: false,
        manage_pricing: false
      },
      finance: {
        read: true,
        create: false,
        update: false,
        delete: false,
        approve: false,
        bulk_operations: false,
        export: true,
        import: false,
        manage_templates: false,
        view_history: false,
        quality_control: false,
        manage_pricing: true
      },
      staff: {
        read: true,
        create: false,
        update: false,
        delete: false,
        approve: false,
        bulk_operations: false,
        export: false,
        import: false,
        manage_templates: false,
        view_history: false,
        quality_control: true,
        manage_pricing: false
      }
    };

    // Check if user has permission for the requested action
    const userPermissions = testPermissions[userRole];
    
    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Invalid user role for test operations'
      });
    }

    if (!userPermissions[action]) {
      return res.status(403).json({
        success: false,
        message: `Access denied. You don't have permission to ${action} tests`
      });
    }

    // Special handling for pricing updates
    if (action === 'update' && req.path.includes('/pricing')) {
      if (!userPermissions.manage_pricing) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot manage test pricing'
        });
      }
    }

    // Add lab context for multi-tenant access
    if (userRole !== 'super_admin') {
      req.labContext = {
        labId: labId,
        restrictToLab: true
      };
    }

    next();
  };
};

/**
 * Middleware to validate bulk operations for tests
 */
export const validateTestBulkOperation = (req, res, next) => {
  const { testIds } = req.body;
  const userRole = req.user.role;

  if (!Array.isArray(testIds) || testIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Test IDs array is required'
    });
  }

  // Limit bulk operations based on role
  const maxBulkSize = {
    super_admin: 1000,
    lab_admin: 500,
    technician: 0,
    receptionist: 0,
    finance: 0,
    staff: 0
  };

  const maxAllowed = maxBulkSize[userRole] || 0;

  if (testIds.length > maxAllowed) {
    return res.status(400).json({
      success: false,
      message: `Bulk operation limited to ${maxAllowed} tests for your role`
    });
  }

  next();
};

/**
 * Middleware to check test ownership/access within lab context
 */
export const checkTestAccess = async (req, res, next) => {
  try {
    const testId = req.params.id;
    const userRole = req.user.role;
    const userLabId = req.user.labId;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: 'Test ID is required'
      });
    }

    // Import mongoose dynamically
    const mongoose = (await import('mongoose')).default;
    
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid test ID'
      });
    }

    // Super admin has access to all tests
    if (userRole === 'super_admin') {
      return next();
    }

    // Check if test belongs to user's lab
    const Test = mongoose.model('Test');
    const test = await Test.findById(testId).select('labId');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    if (test.labId.toString() !== userLabId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Test belongs to a different lab'
      });
    }

    next();
  } catch (error) {
    console.error('Check test access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify test access',
      error: error.message
    });
  }
};
