import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PatientManagement from "../features/patients/pages/PatientManagement";
import SampleTracking from "../pages/sampletracking";
import ReportManagement from "../features/reports/pages/ReportManagement";
import InvoiceManagement from "../features/invoices/pages/InvoiceManagement";
import StaffDashboard from "../features/dashboard/components/StaffDashboard";
import TestManagement from "../features/tests/pages/TestManagement";
// Staff Routes
const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<StaffDashboard />} />
      <Route path="patients" element={<PatientManagement />} />
      <Route path="samples" element={<SampleTracking />} />
      <Route path="tests" element={<TestManagement />} />
      <Route path="reports" element={<ReportManagement />} />
      <Route path="invoices" element={<InvoiceManagement />} />
      <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
    </Routes>
  );
};

export default StaffRoutes;
