import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ProtectedRoute, RoleProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import LandingPage from './pages/landingpage';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LabAdminDashboard from './pages/LabAdminDashboard';
import PatientManagement from './pages/patientmanagement';
import SampleTracking from './pages/sampletracking';
import StaffManagement from './pages/StaffManagement';
import ReportManagement from './pages/reportmanagement';
import InvoiceManagement from './pages/invoicemanagement';

// Components
import NotificationCenter from './components/NotificationCenter';

// Styles
import './styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Routes */}
            <Route
              path="/super-admin/*"
              element={
                <RoleProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminRoutes />
                </RoleProtectedRoute>
              }
            />

            {/* Lab Admin Routes */}
            <Route
              path="/lab-admin/*"
              element={
                <RoleProtectedRoute allowedRoles={['lab_admin']}>
                  <LabAdminRoutes />
                </RoleProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/*"
              element={
                <RoleProtectedRoute allowedRoles={['technician', 'receptionist', 'finance']}>
                  <StaffRoutes />
                </RoleProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                style: {
                  border: '1px solid #10b981',
                  color: '#065f46',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: 'white',
                },
              },
              error: {
                style: {
                  border: '1px solid #ef4444',
                  color: '#991b1b',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: 'white',
                },
              },
              loading: {
                style: {
                  border: '1px solid #3b82f6',
                  color: '#1e40af',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: 'white',
                },
              },
            }}
          />

          {/* Notification Center */}
          <NotificationCenter />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Dashboard redirect component based on user role
const DashboardRedirect = () => {
  const { user } = React.useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/super-admin/dashboard" replace />;
    case 'lab_admin':
      return <Navigate to="/lab-admin/dashboard" replace />;
    case 'technician':
    case 'receptionist':
    case 'finance':
      return <Navigate to="/staff/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Super Admin Routes
const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route path="dashboard" element={<SuperAdminDashboard />} />
      <Route path="labs" element={<div>Lab Management (Coming Soon)</div>} />
      <Route path="subscriptions" element={<div>Subscription Management (Coming Soon)</div>} />
      <Route path="analytics" element={<div>Global Analytics (Coming Soon)</div>} />
      <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
      <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
    </Routes>
  );
};

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
      <Route path="templates" element={<div>Template Management (Coming Soon)</div>} />
      <Route path="analytics" element={<div>Lab Analytics (Coming Soon)</div>} />
      <Route path="settings" element={<div>Lab Settings (Coming Soon)</div>} />
      <Route path="*" element={<Navigate to="/lab-admin/dashboard" replace />} />
    </Routes>
  );
};

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

// Staff Dashboard Component
const StaffDashboard = () => {
  const { user } = React.useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.name || 'Staff Member'}
          </h1>
          <p className="text-gray-600 mt-2">
            Role: {user?.role?.replace('_', ' ').toUpperCase()}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">24</div>
                <div className="text-sm text-gray-600">Today's Patients</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">18</div>
                <div className="text-sm text-gray-600">Completed Tests</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">6</div>
                <div className="text-sm text-gray-600">Pending Samples</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="text-sm text-gray-600">Reports Generated</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Add Patient</div>
                    <div className="text-sm text-gray-600">Register new patient</div>
                  </div>
                </button>

                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Scan Sample</div>
                    <div className="text-sm text-gray-600">Track sample status</div>
                  </div>
                </button>

                <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900">Generate Report</div>
                    <div className="text-sm text-gray-600">Create test report</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;