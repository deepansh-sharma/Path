import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PatientManagement from "../../pages/patientmanagement";
import SampleTracking from "../../pages/sampletracking";
import ReportManagement from "../../pages/reportmanagement";
import InvoiceManagement from "../../pages/invoicemanagement";
import StaffDashboard from "../dashboards/StaffDashboard";
// Staff Routes
const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<StaffDashboard />} />
      <Route path="patients" element={<PatientManagement />} />
      <Route path="samples" element={<SampleTracking />} />
      <Route path="reports" element={<ReportManagement />} />
      <Route path="invoices" element={<InvoiceManagement />} />
      <Route path="*" element={<Navigate to="/staff/dashboard" replace />} />
    </Routes>
  );
};

export default StaffRoutes;
