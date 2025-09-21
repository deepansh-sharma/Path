import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiUsers,
  FiDollarSign,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiEdit,
  FiTrash2,
  FiDownload,
  FiSearch,
  FiFileText,
} from "react-icons/fi";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Badge } from "../../../components/ui/Badge";
import { LoadingSpinner } from "../../../components/ui/LoadingSpinner";
import { toast } from "../../../components/ui/Toast";
import api from "../../../utils/axios";
import {
  getSuperAdminMetrics,
  getSuperAdminLabs,
} from "../../../api/superAdminApi";

// Correctly import the modals from the new path
import AddLabModal from "../../labs/components/AddLabModal";
import ViewLabModal from "../../labs/components/ViewLabModal";
import EditLabModal from "../../labs/components/EditLabModal";

const SuperAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [stats, setStats] = useState({
    totalLabs: 0,
    activeLabs: 0,
    inactiveLabs: 0,
    totalRevenue: 0,
  });
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // State for modals
  const [showAddLabModal, setShowAddLabModal] = useState(false);
  const [showViewLabModal, setShowViewLabModal] = useState(false);
  const [showEditLabModal, setShowEditLabModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);

  const fetchLabs = async () => {
    try {
      const labsRes = await api.get("/api/super-admin/labs");
      setLabs(labsRes.data);
    } catch (err) {
      toast.error("Could not refresh labs list.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    toast.info("Generating your report...");
    try {
      const response = await api.get("/api/export/labs", {
        responseType: "blob", // This is crucial for handling file downloads
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "labs-report.csv"); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Report downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log("[Frontend] SuperAdminDashboard: Starting data fetch...");
        setIsLoading(true);

        console.log("[Frontend] SuperAdminDashboard: Fetching metrics...");
        const overviewResponse = await getSuperAdminMetrics();
        console.log(
          "[Frontend] SuperAdminDashboard: Metrics received:",
          overviewResponse
        );

        console.log("[Frontend] SuperAdminDashboard: Fetching labs...");
        const labsResponse = await getSuperAdminLabs();
        console.log(
          "[Frontend] SuperAdminDashboard: Labs received:",
          labsResponse
        );

        // Map the response to match expected stats structure
        const mappedStats = {
          totalLabs: overviewResponse.totalLabs || 0,
          activeLabs: overviewResponse.activeLabs || 0,
          inactiveLabs: overviewResponse.inactiveLabs || 0,
          totalRevenue:
            overviewResponse.totalRevenue ||
            (overviewResponse.metrics &&
              overviewResponse.metrics[0]?.totalRevenue) ||
            0,
        };

        setStats(mappedStats);
        setLabs(labsResponse);
        console.log(
          "[Frontend] SuperAdminDashboard: State updated successfully"
        );
      } catch (err) {
        console.error(
          "[Frontend] SuperAdminDashboard: Error in fetchMetrics:",
          err
        );
        console.error("[Frontend] SuperAdminDashboard: Error details:", {
          message: err.message,
          stack: err.stack,
          response: err.response,
        });
        setError(err.message || "Failed to fetch dashboard data");
        toast({
          title: "Error",
          description: "Could not fetch dashboard data.",
          variant: "danger",
        });
      } finally {
        console.log("[Frontend] SuperAdminDashboard: Setting loading to false");
        setIsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  const filteredLabs = labs.filter((lab) => {
    const matchesSearch =
      (lab.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const labStatus = lab.isActive ? "active" : "inactive";
    const matchesFilter = filterStatus === "all" || labStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewLab = (lab) => {
    setSelectedLab(lab);
    setShowViewLabModal(true);
  };

  const handleEditLab = (lab) => {
    setSelectedLab(lab);
    setShowEditLabModal(true);
  };

  const handleDeleteLab = async (labId) => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this lab? This action cannot be undone."
      )
    ) {
      try {
        await api.delete(`/api/super-admin/labs/${labId}`);
        toast.success("Lab deleted successfully!");
        fetchLabs();
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete lab.");
      }
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "healthcare",
  }) => (
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
                  <span className="text-sm text-green-600 font-medium">
                    +{trend}%
                  </span>
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
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Render Modals */}
      {showAddLabModal && (
        <AddLabModal setShowModal={setShowAddLabModal} fetchLabs={fetchLabs} />
      )}
      {showViewLabModal && (
        <ViewLabModal lab={selectedLab} setShowModal={setShowViewLabModal} />
      )}
      {showEditLabModal && (
        <EditLabModal
          lab={selectedLab}
          setShowModal={setShowEditLabModal}
          fetchLabs={fetchLabs}
        />
      )}

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Super Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Global performance and lab management overview.
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={handleExport}
              disabled={isExporting}
            >
              <FiDownload className="w-4 h-4" />
              <span>{isExporting ? "Exporting..." : "Export Report"}</span>
            </Button>
            <Button
              onClick={() => setShowAddLabModal(true)}
              className="flex items-center space-x-2"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Lab</span>
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Labs"
            value={stats.totalLabs}
            icon={FiUsers}
            trend="8.2"
          />
          <StatCard
            title="Active Labs"
            value={stats.activeLabs}
            icon={FiActivity}
            trend="12.5"
            color="blue"
          />
          <StatCard
            title="Inactive Labs"
            value={stats.inactiveLabs}
            icon={FiFileText}
            color="orange"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            icon={FiDollarSign}
            trend="15.3"
            color="green"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lab Management</CardTitle>
              <div className="flex space-x-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search labs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-healthcare-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="th-cell">Lab Name</th>
                      <th className="th-cell">Contact</th>
                      <th className="th-cell">Plan</th>
                      <th className="th-cell">Status</th>
                      <th className="th-cell">Revenue</th>
                      <th className="th-cell">Users</th>
                      <th className="th-cell">Last Active</th>
                      <th className="th-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLabs.map((lab, index) => (
                      <motion.tr
                        key={lab._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="td-cell">
                          <div className="font-medium">{lab.name}</div>
                          <div className="text-xs text-gray-500">
                            {lab.address?.city}
                          </div>
                        </td>
                        <td className="td-cell">
                          <div>{lab.contact.email}</div>
                          <div className="text-xs text-gray-500">
                            {lab.contact.phone}
                          </div>
                        </td>
                        <td className="td-cell">
                          <Badge
                            variant={
                              lab.subscription?.plan === "premium"
                                ? "success"
                                : "warning"
                            }
                          >
                            {lab.subscription?.plan}
                          </Badge>
                        </td>
                        <td className="td-cell">
                          <Badge variant={lab.isActive ? "success" : "danger"}>
                            {lab.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="td-cell font-medium">
                          ₹{(lab.analytics?.totalRevenue || 0).toLocaleString()}
                        </td>
                        <td className="td-cell">{lab.users?.length || 0}</td>
                        <td className="td-cell">
                          {new Date(lab.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="td-cell">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewLab(lab)}
                            >
                              <FiEye />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditLab(lab)}
                            >
                              <FiEdit />
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteLab(lab._id)}
                            >
                              <FiTrash2 />
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
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
