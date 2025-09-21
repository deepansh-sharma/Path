import api from '../../utils/axios';

// Lab management API endpoints
export const labApi = {
  // Get all labs (Super Admin only)
  getAllLabs: async (params = {}) => {
    try {
      const response = await api.get('/labs', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lab by ID
  getLabById: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new lab (Super Admin only)
  createLab: async (labData) => {
    try {
      const response = await api.post('/labs', labData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update lab
  updateLab: async (labId, labData) => {
    try {
      const response = await api.put(`/labs/${labId}`, labData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete lab (Super Admin only)
  deleteLab: async (labId) => {
    try {
      const response = await api.delete(`/labs/${labId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lab dashboard data
  getDashboardData: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lab staff
  getLabStaff: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/staff`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add staff to lab
  addStaff: async (labId, staffData) => {
    try {
      const response = await api.post(`/labs/${labId}/staff`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update staff
  updateStaff: async (labId, staffId, staffData) => {
    try {
      const response = await api.put(`/labs/${labId}/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Remove staff from lab
  removeStaff: async (labId, staffId) => {
    try {
      const response = await api.delete(`/labs/${labId}/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get lab settings
  getLabSettings: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/settings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update lab settings
  updateLabSettings: async (labId, settings) => {
    try {
      const response = await api.put(`/labs/${labId}/settings`, settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default labApi;