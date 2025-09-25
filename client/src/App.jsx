import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider as CustomThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import pages
import LandingPage from "./features/landing/pages/LandingPage";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";

// Import extracted components
import DashboardRedirect from "./routes/DashboardRedirect";
import SuperAdminRoutes from "./routes/SuperAdminRoutes";
import LabAdminRoutes from "./routes/LabAdminRoutes";
import StaffRoutes from "./routes/StaffRoutes";
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
      <CustomThemeProvider>
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
              position="bottom-right"
              theme="light"
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
      </CustomThemeProvider>
    </AuthProvider>
  );
}

export default App;
