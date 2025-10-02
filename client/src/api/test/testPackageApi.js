import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const testPackageApi = axios.create({
  baseURL: `${API_BASE_URL}/test-packages`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
testPackageApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Test Package Management API calls
export const testPackageApiService = {
  // Get all test packages with filtering and pagination
  getTestPackages: async (params = {}) => {
    try {
      const response = await testPackageApi.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get single test package by ID
  getTestPackage: async (id) => {
    try {
      const response = await testPackageApi.get(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new test package
  createTestPackage: async (packageData) => {
    try {
      const response = await testPackageApi.post('/', packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update test package
  updateTestPackage: async (id, packageData) => {
    try {
      const response = await testPackageApi.put(`/${id}`, packageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete test package
  deleteTestPackage: async (id) => {
    try {
      const response = await testPackageApi.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add test to package
  addTestToPackage: async (packageId, testId) => {
    try {
      const response = await testPackageApi.post(`/${packageId}/tests/${testId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove test from package
  removeTestFromPackage: async (packageId, testId) => {
    try {
      const response = await testPackageApi.delete(`/${packageId}/tests/${testId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update package pricing
  updatePackagePricing: async (id, pricingData) => {
    try {
      const response = await testPackageApi.put(`/${id}/pricing`, pricingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle package status (enable/disable)
  togglePackageStatus: async (id, isActive) => {
    try {
      const response = await testPackageApi.patch(`/${id}/toggle-status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Duplicate package
  duplicatePackage: async (id, { name, code }) => {
    try {
      const response = await testPackageApi.post(`/${id}/duplicate`, { name, code });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get package categories
  getPackageCategories: async () => {
    try {
      const response = await testPackageApi.get('/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get package statistics
  getPackageStats: async (params = {}) => {
    try {
      const response = await testPackageApi.get('/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get package analytics
  getPackageAnalytics: async (id, params = {}) => {
    try {
      const response = await testPackageApi.get(`/${id}/analytics`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get popular packages
  getPopularPackages: async (params = {}) => {
    try {
      const response = await testPackageApi.get('/popular', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calculate package pricing
  calculatePackagePricing: async (testIds, discountPercentage = 0) => {
    try {
      const response = await testPackageApi.post('/calculate-pricing', {
        testIds,
        discountPercentage,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default testPackageApiService;