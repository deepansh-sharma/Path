import api from '../../utils/axios';

// Report management API endpoints
export const reportApi = {
  // Get all reports
  getAllReports: async (params = {}) => {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get report by ID
  getReportById: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update report
  updateReport: async (reportId, reportData) => {
    try {
      const response = await api.put(`/reports/${reportId}`, reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await api.delete(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get report templates
  getTemplates: async (params = {}) => {
    try {
      const response = await api.get('/reports/templates', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create report template
  createTemplate: async (templateData) => {
    try {
      const response = await api.post('/reports/templates', templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update report template
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await api.put(`/reports/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete report template
  deleteTemplate: async (templateId) => {
    try {
      const response = await api.delete(`/reports/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate report PDF
  generatePDF: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add digital signature
  addSignature: async (reportId, signatureData) => {
    try {
      const response = await api.post(`/reports/${reportId}/signature`, signatureData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve report
  approveReport: async (reportId, approvalData) => {
    try {
      const response = await api.post(`/reports/${reportId}/approve`, approvalData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send report to patient
  sendToPatient: async (reportId, sendData) => {
    try {
      const response = await api.post(`/reports/${reportId}/send`, sendData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get report statistics
  getReportStats: async (params = {}) => {
    try {
      const response = await api.get('/reports/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search reports
  searchReports: async (query, params = {}) => {
    try {
      const response = await api.get('/reports/search', { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default reportApi;