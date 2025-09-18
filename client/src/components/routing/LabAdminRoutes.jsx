import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LabAdminDashboard from '../../pages/LabAdminDashboard';
import PatientManagement from '../../pages/patientmanagement';
import SampleTracking from '../../pages/sampletracking';
import StaffManagement from '../../pages/StaffManagement';
import ReportManagement from '../../pages/reportmanagement';
import InvoiceManagement from '../../pages/invoicemanagement';

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