import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminDashboard from '../../pages/SuperAdminDashboard';

// Super Admin Routes
const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<SuperAdminDashboard />} />
      <Route path="labs" element={<div>Lab Management (Coming Soon)</div>} />
      <Route
        path="subscriptions"
        element={<div>Subscription Management (Coming Soon)</div>}
      />
      <Route
        path="analytics"
        element={<div>Global Analytics (Coming Soon)</div>}
      />
      <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
      <Route
        path="*"
        element={<Navigate to="/super-admin/dashboard" replace />}
      />
    </Routes>
  );
};

export default SuperAdminRoutes;