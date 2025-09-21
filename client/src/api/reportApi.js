import api from '../utils/axios';

/**
 * Report API functions
 * Handles report generation, templates, and management
 */

export const reportApi = {
  // Get all reports for a lab
  getAllReports: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/reports`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch reports' };
    }
  },

  // Get report by ID
  getReportById: async (labId, reportId) => {
    try {
      const response = await api.get(`/labs/${labId}/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch report details' };
    }
  },

  // Create new report
  createReport: async (labId, reportData) => {
    try {
      const response = await api.post(`/labs/${labId}/reports`, reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create report' };
    }
  },

  // Update report
  updateReport: async (labId, reportId, reportData) => {
    try {
      const response = await api.put(`/labs/${labId}/reports/${reportId}`, reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update report' };
    }
  },

  // Delete report
  deleteReport: async (labId, reportId) => {
    try {
      const response = await api.delete(`/labs/${labId}/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete report' };
    }
  },

  // Generate report PDF
  generateReportPDF: async (labId, reportId) => {
    try {
      const response = await api.get(`/labs/${labId}/reports/${reportId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate PDF' };
    }
  },

  // Send report to patient
  sendReportToPatient: async (labId, reportId, method = 'email') => {
    try {
      const response = await api.post(`/labs/${labId}/reports/${reportId}/send`, { method });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send report' };
    }
  },

  // Get report templates
  getReportTemplates: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/report-templates`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch report templates' };
    }
  },

  // Create report template
  createReportTemplate: async (labId, templateData) => {
    try {
      const response = await api.post(`/labs/${labId}/report-templates`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create report template' };
    }
  },

  // Update report template
  updateReportTemplate: async (labId, templateId, templateData) => {
    try {
      const response = await api.put(`/labs/${labId}/report-templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update report template' };
    }
  },

  // Delete report template
  deleteReportTemplate: async (labId, templateId) => {
    try {
      const response = await api.delete(`/labs/${labId}/report-templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete report template' };
    }
  },

  // Approve report
  approveReport: async (labId, reportId) => {
    try {
      const response = await api.post(`/labs/${labId}/reports/${reportId}/approve`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to approve report' };
    }
  },

  // Reject report
  rejectReport: async (labId, reportId, reason) => {
    try {
      const response = await api.post(`/labs/${labId}/reports/${reportId}/reject`, { reason });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to reject report' };
    }
  },

  // Get report statistics
  getReportStats: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/reports/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch report statistics' };
    }
  }
};

export default reportApi;