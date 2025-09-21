import api from '../utils/axios';

/**
 * Laboratory API functions
 * Handles lab management, settings, and configuration
 */

export const labApi = {
  // Get all labs (Super Admin only)
  getAllLabs: async () => {
    try {
      const response = await api.get('/labs');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch labs' };
    }
  },

  // Get lab by ID
  getLabById: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch lab details' };
    }
  },

  // Create new lab (Super Admin only)
  createLab: async (labData) => {
    try {
      const response = await api.post('/labs', labData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create lab' };
    }
  },

  // Update lab
  updateLab: async (labId, labData) => {
    try {
      const response = await api.put(`/labs/${labId}`, labData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update lab' };
    }
  },

  // Delete lab (Super Admin only)
  deleteLab: async (labId) => {
    try {
      const response = await api.delete(`/labs/${labId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete lab' };
    }
  },

  // Get lab settings
  getLabSettings: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/settings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch lab settings' };
    }
  },

  // Update lab settings
  updateLabSettings: async (labId, settings) => {
    try {
      const response = await api.put(`/labs/${labId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update lab settings' };
    }
  },

  // Get lab statistics
  getLabStats: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch lab statistics' };
    }
  },

  // Get lab subscription details
  getLabSubscription: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/subscription`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch subscription details' };
    }
  },

  // Update lab subscription
  updateLabSubscription: async (labId, subscriptionData) => {
    try {
      const response = await api.put(`/labs/${labId}/subscription`, subscriptionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update subscription' };
    }
  }
};

export default labApi;