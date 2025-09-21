import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiUsers,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiShield,
  FiEye,
  FiDownload,
  FiUpload,
  FiBarChart2,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiRefreshCw,
  FiSend,
  FiSettings,
  FiAlertCircle,
} from "react-icons/fi";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { toast } from "../components/ui/Toast";
import { AuthContext } from "../contexts/AuthContext";
import { staffApi } from "../api";

const StaffManagement = () => {
  const { user } = useContext(AuthContext);
  const [staff, setStaff] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [rolesAndPermissions, setRolesAndPermissions] = useState({
    roles: [],
    permissions: [],
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "staff",
    department: "",
    hireDate: "",
    address: "",
    emergencyContact: "",
    permissions: [],
  });
  const [inviteData, setInviteData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
  });

  // Get lab ID from user context
  const labId = user?.labId?._id || user?.labId;

  // Fetch staff data
  const fetchStaff = async (page = 1) => {
    if (!labId) return;

    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.itemsPerPage,
        search: searchTerm,
        role: filterRole !== "all" ? filterRole : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        department: filterDepartment !== "all" ? filterDepartment : undefined,
      };

      const response = await staffApi.getStaff(labId, params);

      if (response.success) {
        setStaff(response.data.staff);
        setPagination(response.data.pagination);
      } else {
        toast.error("Failed to fetch staff data");
      }
    } catch (error) {
      console.error("Fetch staff error:", error);
      toast.error("Failed to fetch staff data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!labId) return;

    try {
      const response = await staffApi.getStaffDashboard(labId);

      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.error("Fetch dashboard data error:", error);
    }
  };

  // Fetch roles and permissions
  const fetchRolesAndPermissions = async () => {
    try {
      const response = await staffApi.getRolesAndPermissions();

      if (response.success) {
        setRolesAndPermissions(response.data);
      }
    } catch (error) {
      console.error("Fetch roles and permissions error:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (labId) {
      fetchStaff();
      fetchDashboardData();
      fetchRolesAndPermissions();
    }
  }, [labId]);

  // Refetch when filters change
  useEffect(() => {
    if (labId) {
      fetchStaff(1);
    }
  }, [searchTerm, filterRole, filterStatus, filterDepartment]);

  const handleAddStaff = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "staff",
      department: "",
      hireDate: "",
      address: "",
      emergencyContact: "",
      permissions: [],
    });
    setShowAddModal(true);
  };

  const handleEditStaff = async (member) => {
    try {
      const response = await staffApi.getStaffById(labId, member._id);

      if (response.success) {
        setSelectedStaff(response.data);
        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          phone: response.data.phone || "",
          role: response.data.role,
          department: response.data.department || "",
          hireDate: response.data.hireDate
            ? response.data.hireDate.split("T")[0]
            : "",
          address: response.data.address || "",
          emergencyContact: response.data.emergencyContact || "",
          permissions: response.data.permissions || [],
        });
        setShowEditModal(true);
      }
    } catch (error) {
      console.error("Fetch staff details error:", error);
      toast.error("Failed to fetch staff details");
    }
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      setActionLoading(true);
      const response = await staffApi.toggleStaffStatus(
        labId,
        staffMember._id,
        {
          isActive: !staffMember.isActive,
        }
      );

      if (response.success) {
        toast.success(
          `${staffMember.firstName} ${staffMember.lastName} ${
            staffMember.isActive ? "deactivated" : "activated"
          } successfully`
        );
        fetchStaff(pagination.currentPage);
        fetchDashboardData();
      } else {
        toast.error("Failed to update staff status");
      }
    } catch (error) {
      console.error("Toggle staff status error:", error);
      toast.error("Failed to update staff status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteStaff = async (staffMember) => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${staffMember.firstName} ${staffMember.lastName}?`
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await staffApi.deleteStaff(labId, staffMember._id);

      if (response.success) {
        toast.success("Staff member deleted successfully");
        fetchStaff(pagination.currentPage);
        fetchDashboardData();
      } else {
        toast.error("Failed to delete staff member");
      }
    } catch (error) {
      console.error("Delete staff error:", error);
      toast.error("Failed to delete staff member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      let response;

      if (selectedStaff) {
        // Update existing staff
        response = await staffApi.updateStaff(
          labId,
          selectedStaff._id,
          formData
        );
      } else {
        // Add new staff
        response = await staffApi.createStaff(labId, formData);
      }

      if (response.success) {
        toast.success(
          `Staff member ${selectedStaff ? "updated" : "created"} successfully`
        );
        setShowAddModal(false);
        setShowEditModal(false);
        setSelectedStaff(null);
        fetchStaff(pagination.currentPage);
        fetchDashboardData();
      } else {
        toast.error(
          response.message ||
            `Failed to ${selectedStaff ? "update" : "create"} staff member`
        );
      }
    } catch (error) {
      console.error("Submit staff error:", error);
      toast.error(
        `Failed to ${selectedStaff ? "update" : "create"} staff member`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendInvitation = async (e) => {
    e.preventDefault();

    try {
      setActionLoading(true);
      const response = await staffApi.sendInvitation(labId, inviteData);

      if (response.success) {
        toast.success("Invitation sent successfully");
        setShowInviteModal(false);
        setInviteData({
          firstName: "",
          lastName: "",
          email: "",
          role: "staff",
        });
      } else {
        toast.error(response.message || "Failed to send invitation");
      }
    } catch (error) {
      console.error("Send invitation error:", error);
      toast.error("Failed to send invitation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvitation = async (staffMember) => {
    try {
      setActionLoading(true);
      const response = await staffApi.resendInvitation(labId, staffMember._id);

      if (response.success) {
        toast.success("Invitation resent successfully");
      } else {
        toast.error("Failed to resend invitation");
      }
    } catch (error) {
      console.error("Resend invitation error:", error);
      toast.error("Failed to resend invitation");
    } finally {
      setActionLoading(false);
    }
  };

  const exportStaffData = async () => {
    try {
      setActionLoading(true);
      const response = await staffApi.exportStaff(labId, { format: "csv" });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "staff_data.csv";
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success("Staff data exported successfully");
    } catch (error) {
      console.error("Export staff error:", error);
      toast.error("Failed to export staff data");
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "lab_admin":
        return "bg-purple-100 text-purple-800";
      case "technician":
        return "bg-blue-100 text-blue-800";
      case "receptionist":
        return "bg-green-100 text-green-800";
      case "finance":
        return "bg-yellow-100 text-yellow-800";
      case "staff":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUniqueValues = (key) => {
    return [...new Set(staff.map((member) => member[key]).filter(Boolean))];
  };

  if (loading && !staff.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiUsers className="text-blue-600" />
              Staff Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your laboratory staff and their roles
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => fetchStaff(pagination.currentPage)}
              variant="outline"
              className="flex items-center gap-2"
              disabled={loading}
            >
              <FiRefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </Button>
            <Button
              onClick={exportStaffData}
              variant="outline"
              className="flex items-center gap-2"
              disabled={actionLoading}
            >
              <FiDownload size={16} />
              Export
            </Button>
            <Button
              onClick={() => setShowInviteModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiSend size={16} />
              Invite
            </Button>
            <Button
              onClick={handleAddStaff}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} />
              Add Staff
            </Button>
          </div>
        </div>

        {/* Dashboard KPI Cards */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Staff
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.overview.totalStaff}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    All staff members
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiUsers className="text-blue-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Staff
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData.overview.activeStaff}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {dashboardData.overview.activePercentage}% of total
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <FiUserCheck className="text-green-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Inactive Staff
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {dashboardData.overview.inactiveStaff}
                  </p>
                  <p className="text-xs text-red-600 mt-1">Need attention</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <FiUserX className="text-red-600" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Departments
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardData.departmentDistribution.length}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Active departments
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FiShield className="text-purple-600" size={24} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Recent Staff & Role Distribution */}
        {dashboardData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiClock className="text-blue-600" />
                Recent Staff
              </h3>
              <div className="space-y-3">
                {dashboardData.recentStaff.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-sm">
                          {member.firstName[0]}
                          {member.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{member.role}</p>
                      </div>
                    </div>
                    <Badge
                      className={
                        member.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {member.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-purple-600" />
                Role Distribution
              </h3>
              <div className="space-y-3">
                {dashboardData.roleDistribution.map((role) => (
                  <div
                    key={role._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(role._id)}>
                        {role._id.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <span className="font-semibold text-gray-900">
                      {role.count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search staff by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              {rolesAndPermissions.roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {getUniqueValues("department").map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Staff Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {staff.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {member.firstName[0]}
                              {member.lastName[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.department || "No Department"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-1">
                          <FiMail size={14} />
                          {member.email}
                        </div>
                        {member.phone && (
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FiPhone size={14} />
                            {member.phone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              member.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {member.invitationStatus === "pending" && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              Invitation Pending
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            {new Date(member.lastLogin).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleEditStaff(member)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-800"
                            disabled={actionLoading}
                          >
                            <FiEdit3 size={16} />
                          </Button>
                          <Button
                            onClick={() => handleToggleStatus(member)}
                            variant="ghost"
                            size="sm"
                            className={
                              member.isActive
                                ? "text-red-600 hover:text-red-800"
                                : "text-green-600 hover:text-green-800"
                            }
                            disabled={actionLoading}
                          >
                            {member.isActive ? (
                              <FiUserX size={16} />
                            ) : (
                              <FiUserCheck size={16} />
                            )}
                          </Button>
                          {member.invitationStatus === "pending" && (
                            <Button
                              onClick={() => handleResendInvitation(member)}
                              variant="ghost"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-800"
                              disabled={actionLoading}
                            >
                              <FiSend size={16} />
                            </Button>
                          )}
                          <Button
                            onClick={() => handleDeleteStaff(member)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            disabled={actionLoading}
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing{" "}
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} to{" "}
                {Math.min(
                  pagination.currentPage * pagination.itemsPerPage,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => fetchStaff(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1 || loading}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  onClick={() => fetchStaff(pagination.currentPage + 1)}
                  disabled={
                    pagination.currentPage === pagination.totalPages || loading
                  }
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && staff.length === 0 && (
            <div className="text-center py-12">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No staff members
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first staff member.
              </p>
              <div className="mt-6">
                <Button
                  onClick={handleAddStaff}
                  className="flex items-center gap-2"
                >
                  <FiPlus size={16} />
                  Add Staff Member
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Modals */}
        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData({ ...formData, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="staff">Staff</option>
                        <option value="technician">Technician</option>
                        <option value="lab_admin">Lab Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Department
                      </label>
                      <Input
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hire Date
                      </label>
                      <Input
                        type="date"
                        value={formData.hireDate}
                        onChange={(e) =>
                          setFormData({ ...formData, hireDate: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact
                      </label>
                      <Input
                        value={formData.emergencyContact}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            emergencyContact: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Permissions */}
                  {rolesAndPermissions.permissions.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Permissions
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        {rolesAndPermissions.permissions.map((permission) => (
                          <div
                            key={permission.value}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              id={permission.value}
                              checked={formData.permissions.includes(
                                permission.value
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    permissions: [
                                      ...formData.permissions,
                                      permission.value,
                                    ],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    permissions: formData.permissions.filter(
                                      (p) => p !== permission.value
                                    ),
                                  });
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label
                              htmlFor={permission.value}
                              className="text-sm text-gray-700"
                            >
                              {permission.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setSelectedStaff(null);
                      }}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          {selectedStaff ? "Updating..." : "Adding..."}
                        </>
                      ) : selectedStaff ? (
                        "Update Staff"
                      ) : (
                        "Add Staff"
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invite Modal */}
        <AnimatePresence>
          {showInviteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Send Staff Invitation
                </h2>

                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <Input
                      value={inviteData.firstName}
                      onChange={(e) =>
                        setInviteData({
                          ...inviteData,
                          firstName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <Input
                      value={inviteData.lastName}
                      onChange={(e) =>
                        setInviteData({
                          ...inviteData,
                          lastName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      value={inviteData.email}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      value={inviteData.role}
                      onChange={(e) =>
                        setInviteData({ ...inviteData, role: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {rolesAndPermissions.roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowInviteModal(false)}
                      disabled={actionLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend size={16} className="mr-2" />
                          Send Invitation
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default StaffManagement;
