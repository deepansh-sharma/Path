import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiActivity,
  FiFileText,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiCalendar,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiPlus,
  FiEye,
  FiDownload,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';

const LabAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);

  // Mock data - replace with actual API calls
  const mockStats = {
    totalPatients: 1247,
    todayTests: 45,
    pendingReports: 12,
    monthlyRevenue: 185000,
    completedTests: 234,
    activeStaff: 18,
    pendingInvoices: 8,
    averageReportTime: '2.4 hours',
  };

  const mockRecentActivities = [
    {
      id: 1,
      type: 'test_completed',
      message: 'Blood Test completed for John Doe',
      time: '5 minutes ago',
      status: 'success',
    },
    {
      id: 2,
      type: 'report_generated',
      message: 'Report generated for Patient ID: P001234',
      time: '12 minutes ago',
      status: 'info',
    },
    {
      id: 3,
      type: 'invoice_created',
      message: 'Invoice #INV-2024-001 created',
      time: '25 minutes ago',
      status: 'success',
    },
    {
      id: 4,
      type: 'staff_login',
      message: 'Dr. Sarah Wilson logged in',
      time: '1 hour ago',
      status: 'info',
    },
    {
      id: 5,
      type: 'alert',
      message: 'Low inventory alert: Blood collection tubes',
      time: '2 hours ago',
      status: 'warning',
    },
  ];

  const mockPendingTasks = [
    {
      id: 1,
      title: 'Review pending reports',
      count: 12,
      priority: 'high',
      dueTime: '2 hours',
    },
    {
      id: 2,
      title: 'Approve staff requests',
      count: 3,
      priority: 'medium',
      dueTime: '1 day',
    },
    {
      id: 3,
      title: 'Update inventory',
      count: 5,
      priority: 'low',
      dueTime: '3 days',
    },
    {
      id: 4,
      title: 'Process invoices',
      count: 8,
      priority: 'high',
      dueTime: '4 hours',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setRecentActivities(mockRecentActivities);
      setPendingTasks(mockPendingTasks);
      setIsLoading(false);
    }, 1000);
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'healthcare' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className="flex items-center mt-2">
                  {trend === 'up' ? (
                    <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <FiTrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {trendValue}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last week</span>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'healthcare' }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={onClick}>
        <CardContent className="p-6 text-center">
          <div className={`w-12 h-12 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );

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
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening in your lab today.</p>
          </div>
          <div className="flex space-x-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <Button variant="outline" className="flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={mockStats.totalPatients.toLocaleString()}
            icon={FiUsers}
            trend="up"
            trendValue={8.2}
          />
          <StatCard
            title="Today's Tests"
            value={mockStats.todayTests}
            icon={FiActivity}
            trend="up"
            trendValue={12.5}
            color="blue"
          />
          <StatCard
            title="Pending Reports"
            value={mockStats.pendingReports}
            icon={FiFileText}
            trend="down"
            trendValue={5.1}
            color="orange"
          />
          <StatCard
            title="Monthly Revenue"
            value={`₹${(mockStats.monthlyRevenue / 1000).toFixed(0)}K`}
            icon={FiDollarSign}
            trend="up"
            trendValue={15.3}
            color="green"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Completed Tests"
            value={mockStats.completedTests}
            icon={FiCheckCircle}
            trend="up"
            trendValue={7.8}
            color="green"
          />
          <StatCard
            title="Active Staff"
            value={mockStats.activeStaff}
            icon={FiUsers}
            color="purple"
          />
          <StatCard
            title="Pending Invoices"
            value={mockStats.pendingInvoices}
            icon={FiAlertCircle}
            trend="down"
            trendValue={3.2}
            color="red"
          />
          <StatCard
            title="Avg Report Time"
            value={mockStats.averageReportTime}
            icon={FiClock}
            trend="down"
            trendValue={12.1}
            color="blue"
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Add Patient"
                  description="Register new patient"
                  icon={FiPlus}
                  onClick={() => toast.info('Navigating to Add Patient')}
                />
                <QuickActionCard
                  title="View Reports"
                  description="Check pending reports"
                  icon={FiEye}
                  onClick={() => toast.info('Navigating to Reports')}
                  color="blue"
                />
                <QuickActionCard
                  title="Manage Staff"
                  description="Staff management"
                  icon={FiUsers}
                  onClick={() => toast.info('Navigating to Staff Management')}
                  color="purple"
                />
                <QuickActionCard
                  title="Generate Invoice"
                  description="Create new invoice"
                  icon={FiDollarSign}
                  onClick={() => toast.info('Navigating to Invoice Generation')}
                  color="green"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'success' ? 'bg-green-500' :
                        activity.status === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pending Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toast.info(`Opening ${task.title}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge
                          variant={
                            task.priority === 'high' ? 'destructive' :
                            task.priority === 'medium' ? 'warning' : 'secondary'
                          }
                          size="sm"
                        >
                          {task.count}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">Due in {task.dueTime}</p>
                        </div>
                      </div>
                      <FiEye className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Analytics charts will be implemented with Recharts</p>
                  <p className="text-sm text-gray-500 mt-2">Test volumes, revenue trends, and performance metrics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LabAdminDashboard;