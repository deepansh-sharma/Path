import React, { useState, useEffect } from "react";
import api from "../../../utils/axios";

import { motion } from "framer-motion";
import {
  FiUsers,
  FiActivity,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
  FiRefreshCw,
  FiDownload,
  FiEye,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { toast } from "../../../components/ui/Toast";
import { useAuth } from "../../../contexts/AuthContext";
import { dashboardApi } from "../../../api/dashboardApi";
import RevenueChart from "../../../components/charts/RevenueChart";
import PatientGrowthChart from "../../../components/charts/PatientGrowthChart";
import TestStatusChart from "../../../components/charts/TestStatusChart";
import StatCard from "../../../components/ui/stat-card";
const API_URL = "http://localhost:5000/api/dashboard";

const LabAdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    revenueData: [],
    patientGrowth: [],
    testStatus: [],
    recentActivities: [],
    alerts: [],
  });

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔄 Fetching Lab Admin dashboard data...");
      console.log("👤 Current user:", user);
      console.log("🏥 Lab ID object:", user?.labId);

      // Extract the actual lab ID from the labId object
      const labId = user?.labId?._id;
      console.log("🆔 Extracted Lab ID:", labId);

      if (!labId) {
        throw new Error("Lab ID not found in user data");
      }

      // Use the correct API endpoint for Lab Admin dashboard
      console.log(localStorage);
      const response = await api.get(`${API_URL}/lab/${labId}`);
      console.log("✅ Dashboard data received:", response);
      console.log(response.data.data);

      // Map the API response to match component expectations
      const mappedData = {
        stats: response.data.data.stats || {},
        revenueData: response.data.data.revenueData || [],
        patientGrowth: response.data.data.patientGrowthData || [], // Map patientGrowthData to patientGrowth
        testStatus: response.data.data.testStatusData || [], // Map testStatusData to testStatus
        recentActivities: response.data.data.recentActivities || [],
        alerts: response.data.data.alerts || [],
        lab: response.data.data.lab || {},
      };

      console.log("🔄 Mapped dashboard data:", mappedData);
      setDashboardData(mappedData);
    } catch (err) {
      console.error("❌ Failed to fetch Lab Admin dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
      toast.error(err.message || "Failed to load dashboard data");

      // Set fallback data for development with proper structure
      const fallbackData = {
        stats: {
          totalPatients: 156,
          totalSamples: 342,
          totalReports: 298,
          pendingReports: 23,
          completedTests: 275,
          totalRevenue: 485000,
          pendingPayments: 45000,
        },
        revenueData: [
          { month: "Jan", revenue: 65000 },
          { month: "Feb", revenue: 72000 },
          { month: "Mar", revenue: 68000 },
          { month: "Apr", revenue: 78000 },
          { month: "May", revenue: 82000 },
          { month: "Jun", revenue: 85000 },
        ],
        patientGrowth: [
          { month: "Jan", patients: 45 },
          { month: "Feb", patients: 52 },
          { month: "Mar", patients: 61 },
          { month: "Apr", patients: 68 },
          { month: "May", patients: 75 },
          { month: "Jun", patients: 82 },
        ],
        testStatus: [
          { name: "Completed", value: 275, color: "#10B981" },
          { name: "Pending", value: 45, color: "#F59E0B" },
          { name: "In Progress", value: 22, color: "#3B82F6" },
        ],
        recentActivities: [
          {
            id: 1,
            type: "sample",
            message: "New blood sample collected for John Doe",
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          },
          {
            id: 2,
            type: "report",
            message: "CBC report approved for Jane Smith",
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
          {
            id: 3,
            type: "invoice",
            message: "Payment received for Invoice #INV-2024-001",
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
          },
        ],
        alerts: [
          {
            id: 1,
            type: "warning",
            message: "23 reports pending approval",
            priority: "high",
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            type: "info",
            message: "₹45,000 in pending payments",
            priority: "medium",
            timestamp: new Date().toISOString(),
          },
        ],
        lab: {
          id: "fallback-lab-id",
          name: "Demo Lab",
          address: {
            street: "123 Demo St",
            city: "Demo City",
            state: "Demo State",
            zipCode: "12345",
            country: "Demo Country",
          },
        },
      };

      console.log("🔄 Using fallback data:", fallbackData);
      setDashboardData(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Stat Card Component
  const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => {
    const colorStyles = {
      blue: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: "text-blue-500",
      },
      green: {
        bg: "bg-green-100",
        text: "text-green-600",
        icon: "text-green-500",
      },
      red: {
        bg: "bg-red-100",
        text: "text-red-600",
        icon: "text-red-500",
      },
      purple: {
        bg: "bg-purple-100",
        text: "text-purple-600",
        icon: "text-purple-500",
      },
      orange: {
        bg: "bg-orange-100",
        text: "text-orange-600",
        icon: "text-orange-500",
      },
    };

    const styles = colorStyles[color] || colorStyles.blue;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-900">
                  {value}
                </h3>
                {subtitle && (
                  <p className="text-xs mt-1 text-gray-500">{subtitle}</p>
                )}
                {trend !== undefined && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                        trend > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {trend > 0 ? "+" : ""}
                      {trend}%
                    </span>
                    <span className="text-xs text-gray-500 ml-1.5">
                      vs last month
                    </span>
                  </div>
                )}
              </div>
              <div className={`p-3 rounded-full ${styles.bg}`}>
                {Icon && <Icon className={`w-6 h-6 ${styles.icon}`} />}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lab Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Quick overview of your lab's performance and key metrics
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={fetchDashboardData}
              className="flex items-center space-x-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center">
              <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Total Patients"
            value={dashboardData.stats.totalPatients?.toLocaleString() || "0"}
            icon={FiUsers}
            color="blue"
            trend={12}
          />
          <StatCard
            title="Total Tests"
            value={dashboardData.stats.completedTests?.toLocaleString() || "0"}
            icon={FiActivity}
            color="green"
            subtitle={`${
              dashboardData.stats.totalSamples || 0
            } samples collected`}
          />
          <StatCard
            title="Pending Reports"
            value={dashboardData.stats.pendingReports?.toLocaleString() || "0"}
            icon={FiFileText}
            color="orange"
            subtitle={`${dashboardData.stats.totalReports || 0} total reports`}
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${(
              dashboardData.stats.totalRevenue || 0
            ).toLocaleString()}`}
            icon={FiDollarSign}
            color="purple"
            trend={8}
            subtitle={`₹${(
              dashboardData.stats.pendingPayments || 0
            ).toLocaleString()} pending`}
          />
        </div>

        {/* Charts and Activities Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiActivity className="w-5 h-5 mr-2" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentActivities
                    .slice(0, 5)
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "sample"
                              ? "bg-blue-100"
                              : activity.type === "report"
                              ? "bg-green-100"
                              : "bg-purple-100"
                          }`}
                        >
                          {activity.type === "sample" && (
                            <FiActivity className="w-4 h-4 text-blue-600" />
                          )}
                          {activity.type === "report" && (
                            <FiFileText className="w-4 h-4 text-green-600" />
                          )}
                          {activity.type === "invoice" && (
                            <FiDollarSign className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiAlertCircle className="w-5 h-5 mr-2" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border-l-4 ${
                        alert.priority === "high"
                          ? "bg-red-50 border-red-400"
                          : alert.priority === "medium"
                          ? "bg-yellow-50 border-yellow-400"
                          : "bg-blue-50 border-blue-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {alert.message}
                        </p>
                        <Badge
                          variant={
                            alert.priority === "high"
                              ? "destructive"
                              : alert.priority === "medium"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(alert.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiDollarSign className="w-5 h-5 mr-2" />
                  Revenue Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RevenueChart
                  data={
                    dashboardData.revenueData || [
                      { month: "Jan", revenue: 12000 },
                      { month: "Feb", revenue: 19000 },
                      { month: "Mar", revenue: 15000 },
                      { month: "Apr", revenue: 22000 },
                      { month: "May", revenue: 28000 },
                      { month: "Jun", revenue: 25000 },
                    ]
                  }
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Patient Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FiUsers className="w-5 h-5 mr-2" />
                  Patient Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PatientGrowthChart
                  data={
                    dashboardData.patientGrowth || [
                      { month: "Jan", patients: 45 },
                      { month: "Feb", patients: 52 },
                      { month: "Mar", patients: 49 },
                      { month: "Apr", patients: 63 },
                      { month: "May", patients: 71 },
                      { month: "Jun", patients: 86 },
                    ]
                  }
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Test Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FiActivity className="w-5 h-5 mr-2" />
                Test Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full max-w-md">
                <TestStatusChart
                  data={dashboardData.testStatus.map((status) => ({
                    name: status.name,
                    value: status.value,
                    color: status.color,
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LabAdminDashboard;
