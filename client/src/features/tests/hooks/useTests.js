import { useState, useEffect, useCallback } from "react";
import { testApiService } from "../../../api/test/testApi";
import { useAuth } from "../../../contexts/AuthContext";

export const useTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    category: "",
    status: "",
    specimenType: "",
    processingType: "",
    priceRange: { min: "", max: "" },
    turnaroundTimeRange: { min: "", max: "" },
    parameterCountRange: { min: "", max: "" },
    creationDateRange: { start: "", end: "" },
    creator: "",
    popularOnly: false,
    packageEligible: false,
    hasDiscounts: false
  });

  const { user } = useAuth();

  // Fetch tests with filters and pagination
  const fetchTests = useCallback(async (page = 1, customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters = customFilters || filters;
      const response = await testApiService.getTests({
        page,
        limit: pagination.limit,
        ...queryFilters
      });

      if (response.success) {
        setTests(response.data.tests);
        setPagination({
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        });
      } else {
        setError(response.message || "Failed to fetch tests");
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching tests");
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  // Create new test
  const createTest = useCallback(async (testData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.createTest(testData);

      if (response.success) {
        // Refresh the tests list
        await fetchTests(pagination.page);
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Failed to create test");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while creating test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchTests, pagination.page]);

  // Update existing test
  const updateTest = useCallback(async (testId, testData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.updateTest(testId, testData);

      if (response.success) {
        // Update the test in the local state
        setTests(prevTests => 
          prevTests.map(test => 
            test._id === testId ? { ...test, ...response.data } : test
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Failed to update test");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while updating test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete test
  const deleteTest = useCallback(async (testId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.deleteTest(testId);

      if (response.success) {
        // Remove the test from local state
        setTests(prevTests => prevTests.filter(test => test._id !== testId));
        return { success: true };
      } else {
        setError(response.message || "Failed to delete test");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while deleting test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Clone test
  const cloneTest = useCallback(async (testId, newTestData = {}) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.cloneTest(testId, newTestData);

      if (response.success) {
        // Refresh the tests list
        await fetchTests(pagination.page);
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Failed to clone test");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while cloning test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchTests, pagination.page]);

  // Toggle test status (active/inactive)
  const toggleTestStatus = useCallback(async (testId, status) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.updateTestStatus(testId, status);

      if (response.success) {
        // Update the test status in local state
        setTests(prevTests => 
          prevTests.map(test => 
            test._id === testId ? { ...test, status } : test
          )
        );
        return { success: true };
      } else {
        setError(response.message || "Failed to update test status");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while updating test status";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk operations
  const bulkDeleteTests = useCallback(async (testIds) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.bulkDeleteTests(testIds);

      if (response.success) {
        // Remove deleted tests from local state
        setTests(prevTests => 
          prevTests.filter(test => !testIds.includes(test._id))
        );
        return { success: true };
      } else {
        setError(response.message || "Failed to delete tests");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while deleting tests";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateTestStatus = useCallback(async (testIds, status) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.bulkUpdateTestStatus(testIds, status);

      if (response.success) {
        // Update test statuses in local state
        setTests(prevTests => 
          prevTests.map(test => 
            testIds.includes(test._id) ? { ...test, status } : test
          )
        );
        return { success: true };
      } else {
        setError(response.message || "Failed to update test statuses");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while updating test statuses";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Export tests
  const exportTests = useCallback(async (format = "excel", selectedIds = null) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.exportTests({
        format,
        testIds: selectedIds,
        filters: selectedIds ? null : filters
      });

      if (response.success) {
        // Create download link
        const blob = new Blob([response.data], {
          type: format === "excel" 
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "text/csv"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tests_export_${new Date().toISOString().split('T')[0]}.${format === "excel" ? "xlsx" : "csv"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        return { success: true };
      } else {
        setError(response.message || "Failed to export tests");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while exporting tests";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Import tests
  const importTests = useCallback(async (file, options = {}) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("options", JSON.stringify(options));

      const response = await testApiService.importTests(formData);

      if (response.success) {
        // Refresh the tests list
        await fetchTests(1); // Go to first page after import
        return { 
          success: true, 
          data: response.data,
          imported: response.data.imported,
          errors: response.data.errors || []
        };
      } else {
        setError(response.message || "Failed to import tests");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while importing tests";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [fetchTests]);

  // Get test by ID
  const getTestById = useCallback(async (testId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await testApiService.getTestById(testId);

      if (response.success) {
        return { success: true, data: response.data };
      } else {
        setError(response.message || "Failed to fetch test");
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMessage = err.message || "An error occurred while fetching test";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get test statistics
  const getTestStatistics = useCallback(async () => {
    try {
      const response = await testApiService.getTestStatistics();
      
      if (response.success) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      department: "",
      category: "",
      status: "",
      specimenType: "",
      processingType: "",
      priceRange: { min: "", max: "" },
      turnaroundTimeRange: { min: "", max: "" },
      parameterCountRange: { min: "", max: "" },
      creationDateRange: { start: "", end: "" },
      creator: "",
      popularOnly: false,
      packageEligible: false,
      hasDiscounts: false
    });
  }, []);

  // Change page
  const changePage = useCallback((newPage) => {
    fetchTests(newPage);
  }, [fetchTests]);

  // Change page size
  const changePageSize = useCallback((newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchTests(1); // Reset to first page when changing page size
  }, [fetchTests]);

  // Initial load
  useEffect(() => {
    if (user) {
      fetchTests(1);
    }
  }, [user]); // Only depend on user, not fetchTests to avoid infinite loop

  // Refetch when filters change
  useEffect(() => {
    if (user) {
      fetchTests(1, filters);
    }
  }, [filters, user]); // Only depend on filters and user

  return {
    // Data
    tests,
    loading,
    error,
    pagination,
    filters,

    // Actions
    fetchTests,
    createTest,
    updateTest,
    deleteTest,
    cloneTest,
    toggleTestStatus,
    bulkDeleteTests,
    bulkUpdateTestStatus,
    exportTests,
    importTests,
    getTestById,
    getTestStatistics,

    // Filter actions
    updateFilters,
    clearFilters,

    // Pagination actions
    changePage,
    changePageSize,

    // Utility functions
    refreshTests: () => fetchTests(pagination.page),
    clearError: () => setError(null)
  };
};