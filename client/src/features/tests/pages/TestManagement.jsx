import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "../../../components/ui/Dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/Tabs";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import TestTable from "../components/TestTable";
import TestFilters from "../components/TestFilters";
import TestStats from "../components/TestStats";
import BulkActions from "../components/BulkActions";
import PackageManagement from "../components/PackageManagement";
import QuickTestCreator from "../components/QuickTestCreator";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUpload,
  FiRefreshCw,
  FiGrid,
  FiList,
  FiSettings,
  FiBarChart2,
  FiMenu,
  FiActivity,
  FiPackage,
  FiTrash2,
} from "react-icons/fi";

const TestManagement = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  // Read tab from URL query to enable deep-linking from sidebar
  const { search } = useLocation();

  // Mock data and functions (replace with actual API calls)
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [filters, setFilters] = useState({});

  // Mock functions for test operations
  const fetchTests = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTests([]);
      setLoading(false);
    }, 1000);
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const deleteTest = async (testId) => {
    setTests((prev) => prev.filter((t) => t._id !== testId));
  };

  const cloneTest = async (testId, data) => {
    const originalTest = tests.find((t) => t._id === testId);
    if (originalTest) {
      const clonedTest = {
        ...originalTest,
        _id: Date.now().toString(),
        name: data.name,
        code: data.code,
      };
      setTests((prev) => [clonedTest, ...prev]);
    }
  };

  const toggleTestStatus = async (testId, status) => {
    setTests((prev) =>
      prev.map((test) => (test._id === testId ? { ...test, status } : test))
    );
  };

  const bulkDeleteTests = async (testIds) => {
    setTests((prev) => prev.filter((test) => !testIds.includes(test._id)));
  };

  const bulkUpdateTestStatus = async (testIds, status) => {
    setTests((prev) =>
      prev.map((test) =>
        testIds.includes(test._id) ? { ...test, status } : test
      )
    );
  };

  const exportTests = () => {
    console.log("Exporting tests...");
  };

  const importTests = (file) => {
    console.log("Importing tests from file:", file.name);
  };

  const changePage = (page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Local selection state for bulk actions
  const [selectedTests, setSelectedTests] = useState([]);
  const [activeTab, setActiveTab] = useState("tests"); // tests, packages, create
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, test: null });
  const [cloneModal, setCloneModal] = useState({ show: false, test: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table, grid, compact

  // Initialize active tab from query string (e.g., ?tab=create)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const tab = params.get("tab");
    if (tab && ["tests", "packages", "create"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [search]);

  // Fetch tests on component mount and when filters or page change
  useEffect(() => {
    fetchTests();
  }, [filters, pagination?.page]);

  // Handle search with debounce
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        updateFilters({ search: searchQuery, page: 1 });
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle bulk selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTests(tests.map((test) => test._id));
    } else {
      setSelectedTests([]);
    }
  };

  const handleSelectTest = (testId, checked) => {
    if (checked) {
      setSelectedTests([...selectedTests, testId]);
    } else {
      setSelectedTests(selectedTests.filter((id) => id !== testId));
    }
  };

  // Handle test actions
  const handleCreateTest = () => {
    setActiveTab("create");
    navigate(`?tab=create`, { replace: false });
  };

  const handleEditTest = (test) => {
    navigate(`/lab-admin/tests/${test._id}/edit`);
  };

  const handleViewTest = (test) => {
    navigate(`/lab-admin/tests/${test._id}`);
  };

  const handleDeleteTest = async (test) => {
    await deleteTest(test._id);
    setDeleteModal({ show: false, test: null });
  };

  const handleCloneTest = async (originalTest, formData) => {
    await cloneTest(originalTest._id, formData);
    setCloneModal({ show: false, test: null });
  };

  const handleToggleTestStatus = async (test) => {
    const newStatus = test.status === "active" ? "inactive" : "active";
    await toggleTestStatus(test._id, newStatus);
  };

  const handleBulkAction = async (action) => {
    if (selectedTests.length === 0) return;

    switch (action) {
      case "delete":
        await bulkDeleteTests(selectedTests);
        setSelectedTests([]);
        break;
      case "activate":
        await bulkUpdateTestStatus(selectedTests, "active");
        setSelectedTests([]);
        break;
      case "deactivate":
        await bulkUpdateTestStatus(selectedTests, "inactive");
        setSelectedTests([]);
        break;
      default:
        break;
    }
  };

  const handleExport = () => {
    exportTests();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importTests(file);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Test Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage laboratory tests, packages, and create new test
              configurations
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("tests")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tests"
                  ? "border-healthcare-500 text-healthcare-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiActivity className="inline-block w-4 h-4 mr-2" />
              Tests
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "packages"
                  ? "border-healthcare-500 text-healthcare-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiPackage className="inline-block w-4 h-4 mr-2" />
              Packages
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "create"
                  ? "border-healthcare-500 text-healthcare-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiPlus className="inline-block w-4 h-4 mr-2" />
              Create Test
            </button>
          </nav>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={FiFilter}
          >
            Filters
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport()}
            leftIcon={FiDownload}
          >
            Export
          </Button>

          <Button
            variant="outline"
            onClick={() => document.getElementById("import-file").click()}
            leftIcon={FiUpload}
          >
            Import
          </Button>

          <Button
            onClick={handleCreateTest}
            leftIcon={FiPlus}
            className="bg-healthcare-600 hover:bg-healthcare-700"
          >
            Create Test
          </Button>
        </div>

        {/* Stats Cards */}
        {activeTab === "tests" && <TestStats />}

        {/* Conditional Content Based on Active Tab */}
        {activeTab === "tests" ? (
          <>
            {/* Search and View Controls */}
            <Card className="p-4">
              <div className="flex flex-col lg:flex-row lg-items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search tests by name, code, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={FiSearch}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Select
                    value={viewMode}
                    onChange={setViewMode}
                    options={[
                      { value: "table", label: "Table View" },
                      { value: "grid", label: "Grid View" },
                      { value: "compact", label: "Compact View" },
                    ]}
                    className="w-40"
                  />

                  <Select
                    value="newest"
                    onChange={() => {}}
                    options={[
                      { value: "newest", label: "Newest First" },
                      { value: "oldest", label: "Oldest First" },
                      { value: "name", label: "Name A-Z" },
                      { value: "name-desc", label: "Name Z-A" },
                      { value: "price-low", label: "Price Low-High" },
                      { value: "price-high", label: "Price High-Low" },
                    ]}
                    className="w-40"
                  />
                </div>
              </div>
            </Card>

            {/* Filters Panel */}
            <AnimatePresence>
              {showFilters && (
                <TestFilters
                  filters={filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={() => updateFilters({})}
                />
              )}
            </AnimatePresence>

            {/* Bulk Actions */}
            {selectedTests.length > 0 && (
              <BulkActions
                selectedCount={selectedTests.length}
                onBulkAction={handleBulkAction}
              />
            )}

            {/* Tests Table */}
            <TestTable
              tests={tests}
              loading={loading}
              selectedTests={selectedTests}
              onSelectAll={handleSelectAll}
              onSelectTest={handleSelectTest}
              onEditTest={handleEditTest}
              onViewTest={handleViewTest}
              onDeleteTest={(test) => setDeleteModal({ show: true, test })}
              onCloneTest={(test) => setCloneModal({ show: true, test })}
              onToggleStatus={handleToggleTestStatus}
              viewMode={viewMode}
              pagination={pagination}
              onPageChange={changePage}
            />
          </>
        ) : activeTab === "packages" ? (
          /* Package Management Tab */
          <PackageManagement />
        ) : (
          /* Create Test Tab */
          <QuickTestCreator onTestCreated={() => setActiveTab("tests")} />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteModal.show}
          onOpenChange={(open) =>
            !open && setDeleteModal({ show: false, test: null })
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Test</DialogTitle>
              <DialogClose
                onClick={() => setDeleteModal({ show: false, test: null })}
              />
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Are you sure you want to delete the test "
                {deleteModal.test?.name}"?
              </p>
              <p className="text-sm text-gray-600">
                This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModal({ show: false, test: null })}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTest(deleteModal.test)}
                >
                  Delete Test
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Clone Test Dialog */}
        <Dialog
          open={cloneModal.show}
          onOpenChange={(open) =>
            !open && setCloneModal({ show: false, test: null })
          }
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Clone Test</DialogTitle>
              <DialogClose
                onClick={() => setCloneModal({ show: false, test: null })}
              />
            </DialogHeader>
            <CloneTestForm
              originalTest={cloneModal.test}
              onClone={(formData) => handleCloneTest(cloneModal.test, formData)}
              onCancel={() => setCloneModal({ show: false, test: null })}
            />
          </DialogContent>
        </Dialog>

        {/* Hidden file input for import */}
        <input
          id="import-file"
          type="file"
          accept=".csv,.xlsx,.json"
          onChange={handleImport}
          className="hidden"
        />
      </div>
    </DashboardLayout>
  );
};

// Clone Test Form Component
const CloneTestForm = ({ originalTest, onClone, onCancel }) => {
  const [formData, setFormData] = useState({
    name: originalTest ? `${originalTest.name} (Copy)` : "",
    code: originalTest ? `${originalTest.code}_COPY` : "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onClone(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Name
        </label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter test name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Test Code
        </label>
        <Input
          value={formData.code}
          onChange={(e) =>
            setFormData({ ...formData, code: e.target.value.toUpperCase() })
          }
          placeholder="Enter test code"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-healthcare-600 hover:bg-healthcare-700"
        >
          Clone Test
        </Button>
      </div>
    </form>
  );
};

export default TestManagement;
