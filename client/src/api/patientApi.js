import api from '../utils/axios';

/**
 * Patient API functions
 * Handles patient management, registration, and medical records
 */

export const patientApi = {
  // Get all patients for a lab
  getAllPatients: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/patients`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patients' };
    }
  },

  // Get patient by ID
  getPatientById: async (labId, patientId) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient details' };
    }
  },

  // Create new patient
  createPatient: async (labId, patientData) => {
    try {
      const response = await api.post(`/labs/${labId}/patients`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create patient' };
    }
  },

  // Update patient
  updatePatient: async (labId, patientId, patientData) => {
    try {
      const response = await api.put(`/labs/${labId}/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update patient' };
    }
  },

  // Delete patient
  deletePatient: async (labId, patientId) => {
    try {
      const response = await api.delete(`/labs/${labId}/patients/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete patient' };
    }
  },

  // Search patients
  searchPatients: async (labId, searchTerm) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/search`, {
        params: { q: searchTerm }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search patients' };
    }
  },

  // Get patient medical history
  getPatientHistory: async (labId, patientId) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/${patientId}/history`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient history' };
    }
  },

  // Get patient reports
  getPatientReports: async (labId, patientId) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/${patientId}/reports`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient reports' };
    }
  },

  // Get patient invoices
  getPatientInvoices: async (labId, patientId) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/${patientId}/invoices`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient invoices' };
    }
  },

  // Upload patient document
  uploadPatientDocument: async (labId, patientId, formData) => {
    try {
      const response = await api.post(`/labs/${labId}/patients/${patientId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to upload document' };
    }
  },

  // Get patient statistics
  getPatientStats: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/patients/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch patient statistics' };
    }
  }
};

export default patientApi;