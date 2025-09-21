import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Dashboard redirect component based on user role
const DashboardRedirect = () => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "super_admin":
      return <Navigate to="/super-admin/dashboard" replace />;
    case "lab_admin":
      return <Navigate to="/lab-admin/dashboard" replace />;
    case "technician":
    case "receptionist":
    case "finance":
      return <Navigate to="/staff/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;