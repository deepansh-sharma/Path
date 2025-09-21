import api from '../utils/axios';

export const dashboardApi = {
  // Super Admin Dashboard APIs
  getSuperAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/super-admin');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch super admin dashboard:', error);
      throw error;
    }
  },

  getSuperAdminStats: async () => {
    try {
      const response = await api.get('/dashboard/super-admin/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch super admin stats:', error);
      throw error;
    }
  },

  getSystemMetrics: async (timeRange = '30d') => {
    try {
      const response = await api.get(`/dashboard/super-admin/metrics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      throw error;
    }
  },

  // Lab Admin Dashboard APIs
  getLabAdminDashboard: async (labId) => {
    try {
      console.log(`🏥 Fetching Lab Admin dashboard data for lab: ${labId}...`);
      
      if (!labId) {
        throw new Error('Lab ID is required for Lab Admin dashboard');
      }

      const response = await api.get(`/dashboard/lab-admin/${labId}`);
      console.log('✅ Lab Admin dashboard data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to fetch Lab Admin dashboard:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch Lab Admin dashboard data');
    }
  },

  getLabStats: async (labId) => {
    try {
      const response = await api.get(`/dashboard/lab/${labId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lab stats:', error);
      throw error;
    }
  },

  getLabRevenue: async (labId, timeRange = '12m') => {
    try {
      const response = await api.get(`/dashboard/lab/${labId}/revenue?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lab revenue:', error);
      throw error;
    }
  },

  getPatientGrowth: async (labId, timeRange = '12m') => {
    try {
      const response = await api.get(`/dashboard/lab/${labId}/patient-growth?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch patient growth:', error);
      throw error;
    }
  },

  getTestStatusDistribution: async (labId) => {
    try {
      const response = await api.get(`/dashboard/lab/${labId}/test-status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch test status distribution:', error);
      throw error;
    }
  },

  // Common Dashboard APIs
  getRecentActivities: async (labId = null, limit = 10) => {
    try {
      const url = labId 
        ? `/dashboard/lab/${labId}/activities?limit=${limit}`
        : `/dashboard/activities?limit=${limit}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      throw error;
    }
  },

  getSystemAlerts: async (labId = null, priority = 'all') => {
    try {
      const url = labId 
        ? `/dashboard/lab/${labId}/alerts?priority=${priority}`
        : `/dashboard/alerts?priority=${priority}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system alerts:', error);
      throw error;
    }
  },

  // Analytics APIs
  getRevenueAnalytics: async (labId = null, timeRange = '12m') => {
    try {
      const url = labId 
        ? `/analytics/lab/${labId}/revenue?range=${timeRange}`
        : `/analytics/revenue?range=${timeRange}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch revenue analytics:', error);
      throw error;
    }
  },

  getPerformanceMetrics: async (labId, timeRange = '30d') => {
    try {
      const response = await api.get(`/analytics/lab/${labId}/performance?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
      throw error;
    }
  },

  getStaffPerformance: async (labId, timeRange = '30d') => {
    try {
      const response = await api.get(`/analytics/lab/${labId}/staff-performance?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch staff performance:', error);
      throw error;
    }
  },

  // Export APIs
  exportDashboardReport: async (labId = null, format = 'pdf', timeRange = '30d') => {
    try {
      const url = labId 
        ? `/dashboard/lab/${labId}/export`
        : `/dashboard/export`;
      
      const response = await api.get(url, {
        params: { format, range: timeRange },
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to export dashboard report:', error);
      throw error;
    }
  },

  // Real-time updates
  subscribeToUpdates: (labId = null, callback) => {
    // WebSocket or Server-Sent Events implementation
    // This would be implemented based on your real-time solution
    console.log('Subscribing to real-time updates for lab:', labId);
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from real-time updates');
    };
  }
};

export default dashboardApi;