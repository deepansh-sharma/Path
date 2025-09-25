import api from '../../utils/axios';

// Patient management API endpoints
export const patientApi = {
  // Register new patient (comprehensive registration)
  registerPatient: async (patientData) => {
    try {
      const response = await api.post('/patients/register', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all patients with pagination and filtering
  getAllPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new patient (basic creation)
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await api.put(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const response = await api.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search patients
  searchPatients: async (query, params = {}) => {
    try {
      const response = await api.get('/patients/search', { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient statistics
  getPatientStats: async (params = {}) => {
    try {
      const response = await api.get('/patients/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient medical history
  getPatientHistory: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/history`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add medical history entry
  addHistoryEntry: async (patientId, historyData) => {
    try {
      const response = await api.post(`/patients/${patientId}/history`, historyData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient tests
  getPatientTests: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/tests`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Book test for patient
  bookTest: async (patientId, testData) => {
    try {
      const response = await api.post(`/patients/${patientId}/tests`, testData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient reports
  getPatientReports: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/reports`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get patient invoices
  getPatientInvoices: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/invoices`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default patientApi;