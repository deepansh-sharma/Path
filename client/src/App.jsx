import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import pages
import LandingPage from "./pages/landingpage";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import extracted components
import DashboardRedirect from "./components/routing/DashboardRedirect";
import SuperAdminRoutes from "./components/routing/SuperAdminRoutes";
import LabAdminRoutes from "./components/routing/LabAdminRoutes";
import StaffRoutes from "./components/routing/StaffRoutes";
import ProfileSettings from "./pages/ProfileSettings";
import HelpAndSupport from "./pages/HelpAndSupport";
import AccountSettings from "./pages/AccountSettings";

// Components
import NotificationCenter from "./components/NotificationCenter";

// Styles
import "./styles/globals.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRedirect />
                </ProtectedRoute>
              }
            />

            {/* Settings Routes */}
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/help-support"
              element={
                <ProtectedRoute>
                  <HelpAndSupport />
                </ProtectedRoute>
              }
            />

            {/* Super Admin routes */}
            <Route
              path="/super-admin/*"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <SuperAdminRoutes />
                </ProtectedRoute>
              }
            />

            {/* Lab Admin routes */}
            <Route
              path="/lab-admin/*"
              element={
                <ProtectedRoute requiredRole="lab_admin">
                  <LabAdminRoutes />
                </ProtectedRoute>
              }
            />

            {/* Staff routes */}
            <Route
              path="/staff/*"
              element={
                <ProtectedRoute requiredRole="staff">
                  <StaffRoutes />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />

          {/* Notification Center */}
          <NotificationCenter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
