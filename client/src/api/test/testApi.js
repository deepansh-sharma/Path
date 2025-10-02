import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const testApi = axios.create({
  baseURL: `${API_BASE_URL}/tests`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
testApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Test Management API calls
export const testApiService = {
  // Get all tests with filtering and pagination
  getTests: async (params = {}) => {
    try {
      const response = await testApi.get('/', { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch tests",
      };
    }
  },

  // Get single test by ID
  getTestById: async (id) => {
    try {
      const response = await testApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test",
      };
    }
  },

  // Create new test
  createTest: async (testData) => {
    try {
      const response = await testApi.post('/', testData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to create test",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Update test
  updateTest: async (id, testData) => {
    try {
      const response = await testApi.put(`/${id}`, testData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to update test",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Delete test
  deleteTest: async (id) => {
    try {
      const response = await testApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to delete test",
      };
    }
  },

  // Clone test
  cloneTest: async (id, newTestData = {}) => {
    try {
      const response = await testApi.post(`/${id}/clone`, newTestData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to clone test",
      };
    }
  },

  // Update test status
  updateTestStatus: async (id, status) => {
    try {
      const response = await testApi.patch(`/${id}/status`, { status });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to update test status",
      };
    }
  },

  // Bulk delete tests
  bulkDeleteTests: async (testIds) => {
    try {
      const response = await testApi.delete('/bulk', {
        data: { testIds }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to delete tests",
      };
    }
  },

  // Bulk update test status
  bulkUpdateTestStatus: async (testIds, status) => {
    try {
      const response = await testApi.patch('/bulk/status', {
        testIds,
        status
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to update test statuses",
      };
    }
  },

  // Export tests
  exportTests: async (params = {}) => {
    try {
      const response = await testApi.get('/export', {
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to export tests",
      };
    }
  },

  // Import tests
  importTests: async (formData) => {
    try {
      const response = await testApi.post('/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to import tests",
        errors: error.response?.data?.errors || [],
      };
    }
  },

  // Get test statistics
  getTestStatistics: async () => {
    try {
      const response = await testApi.get('/statistics');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test statistics",
      };
    }
  },

  // Get popular tests
  getPopularTests: async (limit = 10) => {
    try {
      const response = await testApi.get('/popular', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch popular tests",
      };
    }
  },

  // Search tests
  searchTests: async (query, filters = {}) => {
    try {
      const response = await testApi.get('/search', {
        params: { query, ...filters }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to search tests",
      };
    }
  },

  // Get test categories
  getTestCategories: async () => {
    try {
      const response = await testApi.get('/categories');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test categories",
      };
    }
  },

  // Get departments
  getDepartments: async () => {
    try {
      const response = await testApi.get('/departments');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch departments",
      };
    }
  },

  // Get specimen types
  getSpecimenTypes: async () => {
    try {
      const response = await testApi.get('/specimen-types');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch specimen types",
      };
    }
  },

  // Validate test code
  validateTestCode: async (code, excludeId = null) => {
    try {
      const response = await testApi.post('/validate-code', {
        code,
        excludeId
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to validate test code",
      };
    }
  },

  // Get test templates
  getTestTemplates: async () => {
    try {
      const response = await testApi.get('/templates');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test templates",
      };
    }
  },

  // Create test template
  createTestTemplate: async (templateData) => {
    try {
      const response = await testApi.post('/templates', templateData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to create test template",
      };
    }
  },

  // Get reagents for test
  getTestReagents: async (testId) => {
    try {
      const response = await testApi.get(`/${testId}/reagents`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test reagents",
      };
    }
  },

  // Update test reagents
  updateTestReagents: async (testId, reagents) => {
    try {
      const response = await testApi.put(`/${testId}/reagents`, {
        reagents
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to update test reagents",
      };
    }
  },

  // Get test history/audit trail
  getTestHistory: async (testId) => {
    try {
      const response = await testApi.get(`/${testId}/history`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test history",
      };
    }
  },

  // Submit test for approval
  submitTestForApproval: async (testId, comments = '') => {
    try {
      const response = await testApi.post(`/${testId}/submit-approval`, {
        comments
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to submit test for approval",
      };
    }
  },

  // Approve test
  approveTest: async (testId, comments = '') => {
    try {
      const response = await testApi.post(`/${testId}/approve`, {
        comments
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to approve test",
      };
    }
  },

  // Reject test
  rejectTest: async (testId, comments = '') => {
    try {
      const response = await testApi.post(`/${testId}/reject`, {
        comments
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to reject test",
      };
    }
  },

  // Legacy methods for backward compatibility
  getTest: async (id) => {
    return await testApiService.getTestById(id);
  },

  toggleTestStatus: async (id, isActive) => {
    const status = isActive ? 'active' : 'inactive';
    return await testApiService.updateTestStatus(id, status);
  },

  duplicateTest: async (id, { name, code }) => {
    return await testApiService.cloneTest(id, { name, code });
  },

  updateTestPricing: async (id, pricingData) => {
    return await testApiService.updateTest(id, { pricing: pricingData });
  },

  bulkUpdateTests: async (testIds, updates) => {
    // This would need to be implemented based on specific bulk update requirements
    try {
      const response = await testApi.post('/bulk-update', { testIds, updates });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to bulk update tests",
      };
    }
  },

  getTestStats: async (params = {}) => {
    return await testApiService.getTestStatistics();
  },

  getTestQualityControl: async (id, params = {}) => {
    try {
      const response = await testApi.get(`/${id}/quality-control`, { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test quality control data",
      };
    }
  },

  getTestsForPackage: async (params = {}) => {
    try {
      const response = await testApi.get('/for-package', { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch tests for package",
      };
    }
  },

  getTestUsageAnalytics: async (id, params = {}) => {
    try {
      const response = await testApi.get(`/${id}/analytics`, { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to fetch test usage analytics",
      };
    }
  },
};

export default testApiService;