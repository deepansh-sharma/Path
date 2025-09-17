import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { 
  FiLock, 
  FiArrowRight, 
  FiShield, 
  FiAlertTriangle 
} from 'react-icons/fi';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackComponent = null,
  showLoginPrompt = true 
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    hasAnyRole, 
    hasPermission 
  } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    if (!showLoginPrompt) {
      return fallbackComponent || <div>Access denied</div>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-healthcare-50 via-white to-healthcare-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiLock className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Authentication Required
              </CardTitle>
              <CardDescription>
                You need to sign in to access this page
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FiShield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Access</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This area contains sensitive information and requires authentication.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => window.location.href = '/login'}
                  className="w-full"
                  size="lg"
                  rightIcon={FiArrowRight}
                >
                  Sign In
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="w-full"
                >
                  Go Back
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-600">
                Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-medium text-red-900 mb-2">
                    Insufficient Privileges
                  </h4>
                  <p className="text-sm text-red-700">
                    Your current role: <span className="font-semibold">{user?.role}</span>
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Required roles: {requiredRoles.join(', ')}
                  </p>
                </div>
              </div>

              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Contact your administrator if you believe this is an error.
                </p>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    onClick={() => window.history.back()}
                    className="w-full"
                  >
                    Go Back
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );

    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => 
        !hasPermission(permission)
      );

      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <FiShield className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-orange-600">
                  Permission Required
                </CardTitle>
                <CardDescription>
                  You need additional permissions to access this feature
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="text-center">
                    <h4 className="font-medium text-orange-900 mb-2">
                      Missing Permissions
                    </h4>
                    <div className="space-y-1">
                      {missingPermissions.map((permission, index) => (
                        <p key={index} className="text-sm text-orange-700">
                          • {permission.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-600">
                    Contact your administrator to request these permissions.
                  </p>
                  
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => window.history.back()}
                      className="w-full"
                    >
                      Go Back
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = '/dashboard'}
                      className="w-full"
                    >
                      Return to Dashboard
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      );
    }
  }

  // User has access - render the protected content
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

// Higher-order component for easier usage
export const withProtection = (
  Component, 
  requiredRoles = [], 
  requiredPermissions = []
) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute 
        requiredRoles={requiredRoles}
        requiredPermissions={requiredPermissions}
      >
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Role-specific protection components
export const SuperAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['super-admin']}>
    {children}
  </ProtectedRoute>
);

export const LabAdminRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['lab-admin']}>
    {children}
  </ProtectedRoute>
);

export const StaffRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['technician', 'receptionist', 'finance']}>
    {children}
  </ProtectedRoute>
);

export const AdminOrStaffRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['lab-admin', 'technician', 'receptionist', 'finance']}>
    {children}
  </ProtectedRoute>
);

// Alias for RoleProtectedRoute
export const RoleProtectedRoute = ProtectedRoute;

export { ProtectedRoute };
export default ProtectedRoute;