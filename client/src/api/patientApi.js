import api from '../utils/axios';

/**
 * Patient API functions
 * Handles patient management, registration, and medical records
 */

export const patientApi = {
  // Register new patient (comprehensive registration)
  registerPatient: async (patientData) => {
    try {
      const response = await api.post('/patients/register', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to register patient' };
    }
  },

  // Get all patients with pagination and filtering
  getAllPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patients' };
    }
  },

  // Get patient by ID
  getPatientById: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient details' };
    }
  },

  // Create new patient (basic creation)
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create patient' };
    }
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await api.put(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update patient' };
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const response = await api.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete patient' };
    }
  },

  // Search patients
  searchPatients: async (searchTerm, params = {}) => {
    try {
      const response = await api.get('/patients/search', {
        params: { q: searchTerm, ...params }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search patients' };
    }
  },

  // Get patient statistics
  getPatientStats: async (params = {}) => {
    try {
      const response = await api.get('/patients/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient statistics' };
    }
  },

  // Get patient medical history
  getPatientHistory: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient history' };
    }
  },

  // Get patient reports
  getPatientReports: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/reports`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient reports' };
    }
  },

  // Get patient invoices
  getPatientInvoices: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/invoices`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient invoices' };
    }
  },

  // Upload patient document
  uploadPatientDocument: async (patientId, formData) => {
    try {
      const response = await api.post(`/patients/${patientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload document' };
    }
  }
};

export default patientApi;