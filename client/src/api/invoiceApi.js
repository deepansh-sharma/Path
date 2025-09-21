import api from '../utils/axios';

/**
 * Invoice API functions
 * Handles invoice generation, payment tracking, and billing
 */

export const invoiceApi = {
  // Get all invoices for a lab
  getAllInvoices: async (labId, params = {}) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch invoices' };
    }
  },

  // Get invoice by ID
  getInvoiceById: async (labId, invoiceId) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch invoice details' };
    }
  },

  // Create new invoice
  createInvoice: async (labId, invoiceData) => {
    try {
      const response = await api.post(`/labs/${labId}/invoices`, invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create invoice' };
    }
  },

  // Update invoice
  updateInvoice: async (labId, invoiceId, invoiceData) => {
    try {
      const response = await api.put(`/labs/${labId}/invoices/${invoiceId}`, invoiceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update invoice' };
    }
  },

  // Delete invoice
  deleteInvoice: async (labId, invoiceId) => {
    try {
      const response = await api.delete(`/labs/${labId}/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete invoice' };
    }
  },

  // Generate invoice PDF
  generateInvoicePDF: async (labId, invoiceId) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/${invoiceId}/pdf`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to generate invoice PDF' };
    }
  },

  // Send invoice to patient
  sendInvoiceToPatient: async (labId, invoiceId, method = 'email') => {
    try {
      const response = await api.post(`/labs/${labId}/invoices/${invoiceId}/send`, { method });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send invoice' };
    }
  },

  // Mark invoice as paid
  markInvoiceAsPaid: async (labId, invoiceId, paymentData) => {
    try {
      const response = await api.post(`/labs/${labId}/invoices/${invoiceId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to mark invoice as paid' };
    }
  },

  // Get payment history for invoice
  getInvoicePayments: async (labId, invoiceId) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/${invoiceId}/payments`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch payment history' };
    }
  },

  // Apply discount to invoice
  applyDiscount: async (labId, invoiceId, discountData) => {
    try {
      const response = await api.post(`/labs/${labId}/invoices/${invoiceId}/discount`, discountData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to apply discount' };
    }
  },

  // Get overdue invoices
  getOverdueInvoices: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/overdue`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch overdue invoices' };
    }
  },

  // Send payment reminder
  sendPaymentReminder: async (labId, invoiceId) => {
    try {
      const response = await api.post(`/labs/${labId}/invoices/${invoiceId}/reminder`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send payment reminder' };
    }
  },

  // Get invoice statistics
  getInvoiceStats: async (labId) => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch invoice statistics' };
    }
  },

  // Get revenue analytics
  getRevenueAnalytics: async (labId, period = 'month') => {
    try {
      const response = await api.get(`/labs/${labId}/invoices/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch revenue analytics' };
    }
  }
};

export default invoiceApi;