import api from '../../utils/axios';

// Sample tracking API endpoints
export const sampleApi = {
  // Get all samples
  getAllSamples: async (params = {}) => {
    try {
      const response = await api.get('/samples', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sample by ID
  getSampleById: async (sampleId) => {
    try {
      const response = await api.get(`/samples/${sampleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sample by barcode
  getSampleByBarcode: async (barcode) => {
    try {
      const response = await api.get(`/samples/barcode/${barcode}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new sample
  createSample: async (sampleData) => {
    try {
      const response = await api.post('/samples', sampleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update sample
  updateSample: async (sampleId, sampleData) => {
    try {
      const response = await api.put(`/samples/${sampleId}`, sampleData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete sample
  deleteSample: async (sampleId) => {
    try {
      const response = await api.delete(`/samples/${sampleId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate barcode for sample
  generateBarcode: async (sampleId) => {
    try {
      const response = await api.post(`/samples/${sampleId}/barcode`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update sample status
  updateStatus: async (sampleId, statusData) => {
    try {
      const response = await api.put(`/samples/${sampleId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Scan sample (update location/status via barcode)
  scanSample: async (barcode, scanData) => {
    try {
      const response = await api.post(`/samples/scan/${barcode}`, scanData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sample tracking history
  getTrackingHistory: async (sampleId) => {
    try {
      const response = await api.get(`/samples/${sampleId}/tracking`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add tracking entry
  addTrackingEntry: async (sampleId, trackingData) => {
    try {
      const response = await api.post(`/samples/${sampleId}/tracking`, trackingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get samples by status
  getSamplesByStatus: async (status, params = {}) => {
    try {
      const response = await api.get(`/samples/status/${status}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get samples by patient
  getSamplesByPatient: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/samples/patient/${patientId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get sample statistics
  getSampleStats: async (params = {}) => {
    try {
      const response = await api.get('/samples/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search samples
  searchSamples: async (query, params = {}) => {
    try {
      const response = await api.get('/samples/search', { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk update samples
  bulkUpdateSamples: async (sampleIds, updateData) => {
    try {
      const response = await api.put('/samples/bulk', {
        sampleIds,
        ...updateData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default sampleApi;