import api from '../utils/axios';

/**
 * Staff Management API functions
 * Handles staff CRUD operations, role management, and analytics
 */

export const staffApi = {
  // Get all staff members for a lab
  getStaff: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/staff`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff' };
    }
  },

  // Get staff member by ID
  getStaffById: async (labId, staffId) => {
    try {
      const response = await api.get(`/labs/${labId}/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff member' };
    }
  },

  // Create new staff member
  createStaff: async (labId, staffData) => {
    try {
      const response = await api.post(`/labs/${labId}/staff`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create staff member' };
    }
  },

  // Update staff member
  updateStaff: async (labId, staffId, staffData) => {
    try {
      const response = await api.put(`/labs/${labId}/staff/${staffId}`, staffData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update staff member' };
    }
  },

  // Delete staff member
  deleteStaff: async (labId, staffId) => {
    try {
      const response = await api.delete(`/labs/${labId}/staff/${staffId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete staff member' };
    }
  },

  // Toggle staff active/inactive status
  toggleStaffStatus: async (labId, staffId, isActive) => {
    try {
      const response = await api.patch(`/labs/${labId}/staff/${staffId}/status`, { isActive });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update staff status' };
    }
  },

  // Update staff role
  updateStaffRole: async (labId, staffId, role, permissions = []) => {
    try {
      const response = await api.patch(`/labs/${labId}/staff/${staffId}/role`, { 
        role, 
        permissions 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update staff role' };
    }
  },

  // Get staff dashboard data
  getStaffDashboard: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/staff/dashboard`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff dashboard' };
    }
  },

  // Get staff analytics
  getStaffAnalytics: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/staff/analytics`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff analytics' };
    }
  },

  // Get staff performance metrics
  getStaffPerformance: async (labId, staffId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/staff/${staffId}/performance`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch staff performance' };
    }
  },

  // Bulk update staff
  bulkUpdateStaff: async (labId, updates) => {
    try {
      const response = await api.patch(`/labs/${labId}/staff/bulk`, { updates });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to bulk update staff' };
    }
  },

  // Export staff data
  exportStaff: async (labId, format = 'csv', filters = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/staff/export`, {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to export staff data' };
    }
  },

  // Import staff data
  importStaff: async (labId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/labs/${labId}/staff/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to import staff data' };
    }
  },

  // Get available roles and permissions
  getRolesAndPermissions: async () => {
    try {
      const response = await api.get('/staff/roles-permissions');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch roles and permissions' };
    }
  },

  // Send staff invitation
  sendInvitation: async (labId, invitationData) => {
    try {
      const response = await api.post(`/labs/${labId}/staff/invite`, invitationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send invitation' };
    }
  },

  // Resend staff invitation
  resendInvitation: async (labId, staffId) => {
    try {
      const response = await api.post(`/labs/${labId}/staff/${staffId}/resend-invitation`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend invitation' };
    }
  }
};

export default staffApi;