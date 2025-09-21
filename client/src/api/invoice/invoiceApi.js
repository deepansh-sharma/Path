import api from '../../utils/axios';

// Invoice management API endpoints
export const invoiceApi = {
  // Get all invoices
  getAllInvoices: async (params = {}) => {
    try {
      const response = await api.get('/invoices', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const response = await api.post('/invoices', invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, invoiceData) => {
    try {
      const response = await api.put(`/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const response = await api.delete(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate invoice PDF
  generatePDF: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update payment status
  updatePaymentStatus: async (invoiceId, paymentData) => {
    try {
      const response = await api.put(`/invoices/${invoiceId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add payment
  addPayment: async (invoiceId, paymentData) => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/payments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send invoice to patient
  sendToPatient: async (invoiceId, sendData) => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/send`, sendData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Apply discount
  applyDiscount: async (invoiceId, discountData) => {
    try {
      const response = await api.post(`/invoices/${invoiceId}/discount`, discountData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get pending invoices
  getPendingInvoices: async (params = {}) => {
    try {
      const response = await api.get('/invoices/pending', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get overdue invoices
  getOverdueInvoices: async (params = {}) => {
    try {
      const response = await api.get('/invoices/overdue', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get invoice statistics
  getInvoiceStats: async (params = {}) => {
    try {
      const response = await api.get('/invoices/stats', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search invoices
  searchInvoices: async (query, params = {}) => {
    try {
      const response = await api.get('/invoices/search', { 
        params: { q: query, ...params } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default invoiceApi;