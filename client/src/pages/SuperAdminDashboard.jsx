import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlus,
  FiUsers,
  FiBriefcase,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiSettings,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiFilter,
  FiSearch,
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';

const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddLabModal, setShowAddLabModal] = useState(false);

  // Mock data - replace with actual API calls
  const mockStats = {
    totalLabs: 156,
    activeLabs: 142,
    totalRevenue: 2450000,
    monthlyGrowth: 12.5,
    totalUsers: 1247,
    activeSubscriptions: 134,
  };

  const mockLabs = [
    {
      id: 1,
      name: 'HealthPlus Diagnostics',
      email: 'admin@healthplus.com',
      phone: '+91 98765 43210',
      plan: 'Premium',
      status: 'active',
      revenue: 45000,
      users: 25,
      joinDate: '2024-01-15',
      lastActive: '2024-12-20',
      location: 'Mumbai, Maharashtra',
    },
    {
      id: 2,
      name: 'MediCore Labs',
      email: 'contact@medicore.com',
      phone: '+91 87654 32109',
      plan: 'Standard',
      status: 'active',
      revenue: 28000,
      users: 15,
      joinDate: '2024-02-20',
      lastActive: '2024-12-19',
      location: 'Delhi, NCR',
    },
    {
      id: 3,
      name: 'CityPath Diagnostics',
      email: 'info@citypath.com',
      phone: '+91 76543 21098',
      plan: 'Basic',
      status: 'inactive',
      revenue: 12000,
      users: 8,
      joinDate: '2024-03-10',
      lastActive: '2024-12-10',
      location: 'Bangalore, Karnataka',
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLabs(mockLabs);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lab.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || lab.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddLab = () => {
    setShowAddLabModal(true);
  };

  const handleViewLab = (labId) => {
    toast.success(`Viewing lab details for ID: ${labId}`);
  };

  const handleEditLab = (labId) => {
    toast.info(`Editing lab with ID: ${labId}`);
  };

  const handleDeleteLab = (labId) => {
    toast.error(`Deleting lab with ID: ${labId}`);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'healthcare' }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {trend && (
                <div className="flex items-center mt-2">
                  <FiTrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600 font-medium">+{trend}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last month</span>
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
            <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage labs, subscriptions, and monitor global performance</p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <FiDownload className="w-4 h-4" />
              <span>Export Report</span>
            </Button>
            <Button onClick={handleAddLab} className="flex items-center space-x-2">
              <FiPlus className="w-4 h-4" />
              <span>Add New Lab</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <StatCard
            title="Total Labs"
            value={mockStats.totalLabs}
            icon={FiBriefcase}
            trend={8.2}
          />
          <StatCard
            title="Active Labs"
            value={mockStats.activeLabs}
            icon={FiActivity}
            trend={5.1}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(mockStats.totalRevenue / 100000).toFixed(1)}L`}
            icon={FiDollarSign}
            trend={mockStats.monthlyGrowth}
            color="blue"
          />
          <StatCard
            title="Total Users"
            value={mockStats.totalUsers}
            icon={FiUsers}
            trend={15.3}
            color="purple"
          />
          <StatCard
            title="Active Subscriptions"
            value={mockStats.activeSubscriptions}
            icon={FiSettings}
            trend={7.8}
            color="orange"
          />
          <StatCard
            title="Monthly Growth"
            value={`${mockStats.monthlyGrowth}%`}
            icon={FiTrendingUp}
            trend={2.4}
            color="green"
          />
        </div>

        {/* Labs Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <CardTitle>Lab Management</CardTitle>
                <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3 w-full md:w-auto">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search labs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full md:w-64"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Lab Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Plan</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Users</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Last Active</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLabs.map((lab, index) => (
                      <motion.tr
                        key={lab.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{lab.name}</div>
                            <div className="text-sm text-gray-500">{lab.location}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm text-gray-900">{lab.email}</div>
                            <div className="text-sm text-gray-500">{lab.phone}</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={
                              lab.plan === 'Premium' ? 'success' :
                              lab.plan === 'Standard' ? 'warning' : 'secondary'
                            }
                          >
                            {lab.plan}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <Badge
                            variant={lab.status === 'active' ? 'success' : 'destructive'}
                          >
                            {lab.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">₹{lab.revenue.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{lab.users}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">{lab.lastActive}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewLab(lab.id)}
                            >
                              <FiEye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLab(lab.id)}
                            >
                              <FiEdit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteLab(lab.id)}
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Global Revenue Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FiActivity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Revenue charts will be implemented with Recharts</p>
                  <p className="text-sm text-gray-500 mt-2">Monthly revenue trends, lab performance, and growth analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;