import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiPlus, FiSearch, FiFilter, FiEdit3, FiTrash2, FiCopy, 
  FiEye, FiPackage, FiDollarSign, FiPercent, FiUsers,
  FiBarChart2, FiTrendingUp, FiMoreVertical, FiDownload,
  FiToggleLeft, FiToggleRight, FiTag, FiCalendar
} from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../../../components/ui/Dialog";
import Tooltip from "../../../components/ui/Tooltip";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { Pagination } from "../../../components/ui/Pagination";
import { Separator } from "../../../components/ui/Separator";
import { Checkbox } from "../../../components/ui/Checkbox";
import { testPackageApiService } from "../../../api/test/testPackageApi";
import PackageBuilder from "./PackageBuilder";

const PackageManagement = ({ availableTests = [] }) => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    totalRevenue: 0,
    avgSavings: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    priceMin: "",
    priceMax: "",
    isActive: ""
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  const [showFilters, setShowFilters] = useState(false);

  // Package categories
  const packageCategories = [
    "Routine", "Preventive", "Diagnostic", "Specialized", 
    "Emergency", "Wellness", "Cardiac", "Diabetes", "Thyroid"
  ];

  // Fetch packages
  const fetchPackages = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };

      const response = await testPackageApiService.getTestPackages(params);
      
      if (response.success) {
        setPackages(response.data.packages);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch package stats
  const fetchStats = async () => {
    try {
      const response = await testPackageApiService.getPackageStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [pagination.page, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      priceMin: "",
      priceMax: "",
      isActive: ""
    });
  };

  const handleSelectPackage = (packageId) => {
    setSelectedPackages(prev => 
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(packages.map(pkg => pkg._id));
    }
  };

  const handleCreatePackage = () => {
    setEditingPackage(null);
    setShowPackageBuilder(true);
  };

  const handleEditPackage = (packageData) => {
    setEditingPackage(packageData);
    setShowPackageBuilder(true);
  };

  const handleDeletePackage = (packageData) => {
    setPackageToDelete(packageData);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!packageToDelete) return;

    try {
      const response = await testPackageApiService.deleteTestPackage(packageToDelete._id);
      if (response.success) {
        await fetchPackages();
        await fetchStats();
        setShowDeleteModal(false);
        setPackageToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
    }
  };

  const handleToggleStatus = async (packageId, currentStatus) => {
    try {
      const response = await testPackageApiService.togglePackageStatus(packageId, !currentStatus);
      if (response.success) {
        await fetchPackages();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to toggle package status:", error);
    }
  };

  const handleDuplicatePackage = async (packageData) => {
    try {
      const newName = `${packageData.name} (Copy)`;
      const newCode = `${packageData.code}_COPY`;
      
      const response = await testPackageApiService.duplicatePackage(packageData._id, {
        name: newName,
        code: newCode
      });
      
      if (response.success) {
        await fetchPackages();
        await fetchStats();
      }
    } catch (error) {
      console.error("Failed to duplicate package:", error);
    }
  };

  const handlePackageSaved = async () => {
    await fetchPackages();
    await fetchStats();
    setShowPackageBuilder(false);
    setEditingPackage(null);
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge variant={isActive ? "success" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getSavingsPercentage = (pkg) => {
    if (pkg.pricing.totalIndividualPrice === 0) return 0;
    return Math.round((pkg.pricing.discountAmount / pkg.pricing.totalIndividualPrice) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FiPackage className="text-healthcare-600" />
            Test Packages
          </h2>
          <p className="text-gray-600 mt-1">
            Manage test packages and bundle pricing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={FiFilter}
            className={showFilters ? "bg-healthcare-50 border-healthcare-200" : ""}
          >
            Filters
          </Button>

          <Button
            onClick={handleCreatePackage}
            leftIcon={FiPlus}
            className="bg-healthcare-600 hover:bg-healthcare-700"
          >
            Create Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FiToggleRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <FiToggleLeft className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-healthcare-600">
                ₹{stats.totalRevenue?.toLocaleString() || 0}
              </p>
            </div>
            <div className="p-2 bg-healthcare-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-healthcare-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Savings</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.avgSavings?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <FiPercent className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Search packages..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  leftIcon={FiSearch}
                />

                <Select
                  placeholder="Category"
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={[
                    { value: "", label: "All Categories" },
                    ...packageCategories.map(cat => ({ value: cat, label: cat }))
                  ]}
                />

                <Select
                  placeholder="Status"
                  value={filters.isActive}
                  onChange={(value) => handleFilterChange('isActive', value)}
                  options={[
                    { value: "", label: "All Status" },
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" }
                  ]}
                />

                <div className="flex gap-2">
                  <Input
                    placeholder="Min Price"
                    type="number"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                  />
                  <Input
                    placeholder="Max Price"
                    type="number"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions */}
      {selectedPackages.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedPackages.length} package(s) selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FiDownload className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="text-red-600">
                <FiTrash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Packages Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <Checkbox
                    checked={selectedPackages.length === packages.length && packages.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Package
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div>
                      <span className="ml-2 text-gray-600">Loading packages...</span>
                    </div>
                  </td>
                </tr>
              ) : packages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No packages found</p>
                      <p className="text-sm">Create your first test package to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                packages.map((pkg) => (
                  <motion.tr
                    key={pkg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedPackages.includes(pkg._id)}
                        onChange={() => handleSelectPackage(pkg._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {pkg.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {pkg.code} • {pkg.category}
                        </div>
                        {pkg.tags && pkg.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {pkg.tags.slice(0, 2).map((tag, index) => (
                              <Badge key={index} variant="outline" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {pkg.tags.length > 2 && (
                              <Badge variant="outline" size="sm">
                                +{pkg.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pkg.tests?.length || 0} tests
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.tests?.filter(t => t.isOptional).length || 0} optional
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{pkg.pricing?.packagePrice?.toFixed(2) || 0}
                      </div>
                      <div className="text-xs text-gray-500 line-through">
                        ₹{pkg.pricing?.totalIndividualPrice?.toFixed(2) || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-green-600">
                        {getSavingsPercentage(pkg)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        ₹{pkg.pricing?.discountAmount?.toFixed(2) || 0} saved
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(pkg.isActive)}
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu
                        trigger={
                          <Button variant="ghost" size="sm">
                            <FiMoreVertical className="w-4 h-4" />
                          </Button>
                        }
                        items={[
                          {
                            label: "Edit",
                            icon: FiEdit3,
                            onClick: () => handleEditPackage(pkg)
                          },
                          {
                            label: "Duplicate",
                            icon: FiCopy,
                            onClick: () => handleDuplicatePackage(pkg)
                          },
                          {
                            label: pkg.isActive ? "Deactivate" : "Activate",
                            icon: pkg.isActive ? FiToggleLeft : FiToggleRight,
                            onClick: () => handleToggleStatus(pkg._id, pkg.isActive)
                          },
                          { type: "separator" },
                          {
                            label: "Delete",
                            icon: FiTrash2,
                            onClick: () => handleDeletePackage(pkg),
                            className: "text-red-600"
                          }
                        ]}
                      />
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            />
          </div>
        )}
      </Card>

      {/* Package Builder Modal */}
      <PackageBuilder
        isOpen={showPackageBuilder}
        onClose={() => {
          setShowPackageBuilder(false);
          setEditingPackage(null);
        }}
        packageData={editingPackage}
        onSave={handlePackageSaved}
        availableTests={availableTests}
      />

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogClose />
          </DialogHeader>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete "{packageToDelete?.name}"? 
              This will permanently remove the package and all its configurations.
            </p>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Package
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;