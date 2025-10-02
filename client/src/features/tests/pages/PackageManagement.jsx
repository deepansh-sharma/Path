import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiPackage, FiPlus, FiSearch, FiFilter, FiEdit3, FiTrash2, 
  FiEye, FiCopy, FiToggleLeft, FiToggleRight, FiDownload,
  FiUpload, FiMoreVertical, FiBarChart3, FiDollarSign,
  FiUsers, FiTrendingUp, FiCalendar, FiTag
} from "react-icons/fi";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Checkbox } from "../../../components/ui/Checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "../../../components/ui/Dialog";
import { DropdownMenu } from "../../../components/ui/DropdownMenu";
import { Pagination } from "../../../components/ui/Pagination";
import { Separator } from "../../../components/ui/Separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import PackageBuilder from "../components/PackageBuilder";
import { testPackageApiService } from "../../../api/test/testPackageApi";
import { testApiService } from "../../../api/test/testApi";
import { useToast } from "../../../hooks/useToast";

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showPackageBuilder, setShowPackageBuilder] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [stats, setStats] = useState({
    totalPackages: 0,
    activePackages: 0,
    totalRevenue: 0,
    averagePrice: 0
  });

  const { showToast } = useToast();

  // Package categories
  const packageCategories = [
    "Routine", "Preventive", "Diagnostic", "Specialized", 
    "Emergency", "Wellness", "Cardiac", "Diabetes", "Thyroid"
  ];

  // Fetch packages and tests
  useEffect(() => {
    fetchPackages();
    fetchAvailableTests();
  }, [currentPage, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await testPackageApiService.getTestPackages({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      });

      if (response.success) {
        setPackages(response.data.packages || []);
        setStats(response.data.stats || stats);
      }
    } catch (error) {
      showToast("Failed to fetch packages", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTests = async () => {
    try {
      const response = await testApiService.getTests({ 
        limit: 1000, 
        status: 'active' 
      });
      if (response.success) {
        setAvailableTests(response.data.tests || []);
      }
    } catch (error) {
      console.error("Failed to fetch tests:", error);
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

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;

    try {
      const response = await testPackageApiService.deleteTestPackage(packageToDelete._id);
      if (response.success) {
        showToast("Package deleted successfully", "success");
        fetchPackages();
        setShowDeleteModal(false);
        setPackageToDelete(null);
      }
    } catch (error) {
      showToast("Failed to delete package", "error");
    }
  };

  const handleTogglePackageStatus = async (packageId, currentStatus) => {
    try {
      const response = await testPackageApiService.togglePackageStatus(packageId);
      if (response.success) {
        showToast(
          `Package ${currentStatus ? 'deactivated' : 'activated'} successfully`, 
          "success"
        );
        fetchPackages();
      }
    } catch (error) {
      showToast("Failed to update package status", "error");
    }
  };

  const handleDuplicatePackage = async (packageData) => {
    try {
      const response = await testPackageApiService.duplicatePackage(packageData._id);
      if (response.success) {
        showToast("Package duplicated successfully", "success");
        fetchPackages();
      }
    } catch (error) {
      showToast("Failed to duplicate package", "error");
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedPackages.length === 0) return;

    try {
      let response;
      switch (action) {
        case 'activate':
          response = await testPackageApiService.bulkUpdatePackages(
            selectedPackages, 
            { isActive: true }
          );
          break;
        case 'deactivate':
          response = await testPackageApiService.bulkUpdatePackages(
            selectedPackages, 
            { isActive: false }
          );
          break;
        case 'delete':
          response = await testPackageApiService.bulkDeletePackages(selectedPackages);
          break;
        default:
          return;
      }

      if (response.success) {
        showToast(`Bulk ${action} completed successfully`, "success");
        fetchPackages();
        setSelectedPackages([]);
      }
    } catch (error) {
      showToast(`Failed to ${action} packages`, "error");
    }
  };

  const handlePackageSelect = (packageId) => {
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

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || pkg.category === categoryFilter;
    const matchesStatus = !statusFilter || 
                         (statusFilter === 'active' && pkg.isActive) ||
                         (statusFilter === 'inactive' && !pkg.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Package Management</h1>
          <p className="text-gray-600">Create and manage test packages</p>
        </div>
        <Button onClick={handleCreatePackage} className="bg-healthcare-600 hover:bg-healthcare-700">
          <FiPlus className="w-4 h-4 mr-2" />
          Create Package
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Packages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPackages}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Packages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePackages}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-healthcare-100 rounded-lg">
              <FiDollarSign className="w-6 h-6 text-healthcare-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Price</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.averagePrice?.toFixed(0)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiBarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search packages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={FiSearch}
            />
          </div>
          
          <div className="flex gap-4">
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: "", label: "All Categories" },
                ...packageCategories.map(cat => ({ value: cat, label: cat }))
              ]}
              className="w-40"
            />
            
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" }
              ]}
              className="w-32"
            />
            
            <Select
              value={`${sortBy}-${sortOrder}`}
              onChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              options={[
                { value: "createdAt-desc", label: "Newest First" },
                { value: "createdAt-asc", label: "Oldest First" },
                { value: "name-asc", label: "Name A-Z" },
                { value: "name-desc", label: "Name Z-A" },
                { value: "pricing.packagePrice-desc", label: "Price High-Low" },
                { value: "pricing.packagePrice-asc", label: "Price Low-High" }
              ]}
              className="w-40"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedPackages.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                {selectedPackages.length} package(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  Deactivate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Package Table */}
      <Card className="overflow-hidden">
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
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading packages...</p>
                  </td>
                </tr>
              ) : paginatedPackages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <FiPackage className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No packages found</p>
                    <Button
                      onClick={handleCreatePackage}
                      className="mt-4 bg-healthcare-600 hover:bg-healthcare-700"
                    >
                      Create Your First Package
                    </Button>
                  </td>
                </tr>
              ) : (
                paginatedPackages.map((pkg) => (
                  <motion.tr
                    key={pkg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedPackages.includes(pkg._id)}
                        onChange={() => handlePackageSelect(pkg._id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{pkg.name}</div>
                        <div className="text-sm text-gray-500">{pkg.code}</div>
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
                      <Badge variant="outline">{pkg.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {pkg.tests?.length || 0} tests
                      </div>
                      <div className="text-xs text-gray-500">
                        {pkg.tests?.filter(t => !t.isOptional).length || 0} mandatory
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        ₹{pkg.pricing?.packagePrice?.toFixed(2) || '0.00'}
                      </div>
                      {pkg.pricing?.discountPercentage > 0 && (
                        <div className="text-xs text-green-600">
                          {pkg.pricing.discountPercentage}% off
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={pkg.isActive ? "success" : "secondary"}
                        className="flex items-center gap-1"
                      >
                        {pkg.isActive ? (
                          <FiToggleRight className="w-3 h-3" />
                        ) : (
                          <FiToggleLeft className="w-3 h-3" />
                        )}
                        {pkg.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(pkg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
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
                            onClick: () => handleTogglePackageStatus(pkg._id, pkg.isActive)
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
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
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
        onSave={(savedPackage) => {
          fetchPackages();
          showToast(
            `Package ${editingPackage ? 'updated' : 'created'} successfully`,
            "success"
          );
        }}
        availableTests={availableTests}
      />

      {/* Delete Confirmation Modal */}
      <Dialog
        open={showDeleteModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowDeleteModal(false);
            setPackageToDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FiTrash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>Delete Package</DialogTitle>
                <p className="text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <DialogClose onClick={() => {
              setShowDeleteModal(false);
              setPackageToDelete(null);
            }} />
          </DialogHeader>
          
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete "{packageToDelete?.name}"? 
            This will permanently remove the package and all its configurations.
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setPackageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeletePackage}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Package
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PackageManagement;