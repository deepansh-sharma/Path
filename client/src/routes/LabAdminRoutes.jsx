import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LabAdminDashboard from '../features/dashboard/pages/LabAdminDashboard';
import PatientManagement from '../features/patients/pages/PatientManagement';
import SampleTracking from '../pages/sampletracking';
import StaffManagement from '../pages/StaffManagement';
import ReportManagement from '../features/reports/pages/ReportManagement';
import InvoiceManagement from '../features/invoices/pages/InvoiceManagement';

// Lab Admin Routes
const LabAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<LabAdminDashboard />} />
      <Route path="patients" element={<PatientManagement />} />
      <Route path="samples" element={<SampleTracking />} />
      <Route path="staff" element={<StaffManagement />} />
      <Route path="reports" element={<ReportManagement />} />
      <Route path="invoices" element={<InvoiceManagement />} />
      <Route
        path="templates"
        element={<div>Template Management (Coming Soon)</div>}
      />
      <Route
        path="analytics"
        element={<div>Lab Analytics (Coming Soon)</div>}
      />
      <Route path="settings" element={<div>Lab Settings (Coming Soon)</div>} />
      <Route
        path="*"
        element={<Navigate to="/lab-admin/dashboard" replace />}
      />
    </Routes>
  );
};

export default LabAdminRoutes;