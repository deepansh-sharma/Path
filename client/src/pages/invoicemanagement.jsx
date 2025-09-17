import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiDollarSign, FiPlus, FiEdit3, FiTrash2, FiSearch, FiFilter,
  FiDownload, FiSend, FiEye, FiCopy, FiPrinter, FiMail,
  FiCheckCircle, FiClock, FiAlertCircle, FiUser, FiCalendar,
  FiFileText, FiSettings, FiCreditCard, FiTrendingUp
} from 'react-icons/fi';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { toast } from '../components/ui/Toast';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    patientAddress: '',
    services: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    discount: 0,
    tax: 0,
    notes: '',
    dueDate: ''
  });
  const [companySettings, setCompanySettings] = useState({
    name: 'HealthLab Medical Center',
    address: '123 Medical Street, Health City, HC 12345',
    phone: '+1 (555) 123-4567',
    email: 'billing@healthlab.com',
    website: 'www.healthlab.com',
    logo: '',
    taxId: 'TAX123456789',
    bankDetails: 'Bank: Health Bank, Account: 1234567890'
  });

  // Mock data
  useEffect(() => {
    const mockInvoices = [
      {
        id: 'INV-2024-001',
        patientId: 'P001',
        patientName: 'John Doe',
        patientEmail: 'john.doe@email.com',
        patientPhone: '+1 (555) 123-4567',
        patientAddress: '123 Main St, City, State 12345',
        services: [
          { description: 'Complete Blood Count (CBC)', quantity: 1, rate: 85.00, amount: 85.00 },
          { description: 'Lipid Panel', quantity: 1, rate: 120.00, amount: 120.00 },
          { description: 'Consultation Fee', quantity: 1, rate: 150.00, amount: 150.00 }
        ],
        subtotal: 355.00,
        discount: 35.50,
        tax: 31.95,
        total: 351.45,
        status: 'paid',
        createdAt: '2024-01-15T09:30:00',
        dueDate: '2024-02-15T00:00:00',
        paidAt: '2024-01-20T14:30:00',
        paymentMethod: 'Credit Card',
        notes: 'Regular health checkup package'
      },
      {
        id: 'INV-2024-002',
        patientId: 'P002',
        patientName: 'Jane Smith',
        patientEmail: 'jane.smith@email.com',
        patientPhone: '+1 (555) 234-5678',
        patientAddress: '456 Oak Ave, City, State 12345',
        services: [
          { description: 'Urine Analysis', quantity: 1, rate: 45.00, amount: 45.00 },
          { description: 'X-Ray Chest', quantity: 1, rate: 200.00, amount: 200.00 }
        ],
        subtotal: 245.00,
        discount: 0,
        tax: 24.50,
        total: 269.50,
        status: 'pending',
        createdAt: '2024-01-16T11:00:00',
        dueDate: '2024-02-16T00:00:00',
        paidAt: null,
        paymentMethod: null,
        notes: 'Follow-up examination'
      },
      {
        id: 'INV-2024-003',
        patientId: 'P003',
        patientName: 'Mike Johnson',
        patientEmail: 'mike.johnson@email.com',
        patientPhone: '+1 (555) 345-6789',
        patientAddress: '789 Pine St, City, State 12345',
        services: [
          { description: 'MRI Scan', quantity: 1, rate: 800.00, amount: 800.00 },
          { description: 'Radiologist Consultation', quantity: 1, rate: 200.00, amount: 200.00 }
        ],
        subtotal: 1000.00,
        discount: 100.00,
        tax: 90.00,
        total: 990.00,
        status: 'overdue',
        createdAt: '2024-01-10T14:20:00',
        dueDate: '2024-01-25T00:00:00',
        paidAt: null,
        paymentMethod: null,
        notes: 'Emergency scan - insurance pending'
      },
      {
        id: 'INV-2024-004',
        patientId: 'P004',
        patientName: 'Sarah Brown',
        patientEmail: 'sarah.brown@email.com',
        patientPhone: '+1 (555) 456-7890',
        patientAddress: '321 Elm St, City, State 12345',
        services: [
          { description: 'Pathology Biopsy', quantity: 1, rate: 350.00, amount: 350.00 },
          { description: 'Lab Processing Fee', quantity: 1, rate: 75.00, amount: 75.00 }
        ],
        subtotal: 425.00,
        discount: 0,
        tax: 42.50,
        total: 467.50,
        status: 'draft',
        createdAt: '2024-01-17T16:45:00',
        dueDate: '2024-02-17T00:00:00',
        paidAt: null,
        paymentMethod: null,
        notes: 'Pathology analysis - rush order'
      }
    ];

    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    let matchesPeriod = true;
    if (filterPeriod !== 'all') {
      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();
      const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
      
      switch (filterPeriod) {
        case 'today':
          matchesPeriod = daysDiff === 0;
          break;
        case 'week':
          matchesPeriod = daysDiff <= 7;
          break;
        case 'month':
          matchesPeriod = daysDiff <= 30;
          break;
        case 'quarter':
          matchesPeriod = daysDiff <= 90;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const calculateTotals = () => {
    const total = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
    const pending = invoices.filter(inv => inv.status === 'pending').reduce((sum, invoice) => sum + invoice.total, 0);
    const overdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, invoice) => sum + invoice.total, 0);
    
    return { total, paid, pending, overdue };
  };

  const totals = calculateTotals();

  const handleCreateInvoice = () => {
    setFormData({
      patientId: '',
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      patientAddress: '',
      services: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
      discount: 0,
      tax: 0,
      notes: '',
      dueDate: ''
    });
    setShowCreateModal(true);
  };

  const handleAddService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const handleRemoveService = (index) => {
    const newServices = formData.services.filter((_, i) => i !== index);
    setFormData({ ...formData, services: newServices });
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...formData.services];
    newServices[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newServices[index].amount = newServices[index].quantity * newServices[index].rate;
    }
    
    setFormData({ ...formData, services: newServices });
  };

  const calculateInvoiceTotal = () => {
    const subtotal = formData.services.reduce((sum, service) => sum + service.amount, 0);
    const discountAmount = (subtotal * formData.discount) / 100;
    const taxAmount = ((subtotal - discountAmount) * formData.tax) / 100;
    const total = subtotal - discountAmount + taxAmount;
    
    return { subtotal, discountAmount, taxAmount, total };
  };

  const handleSubmitInvoice = (e) => {
    e.preventDefault();
    
    const { subtotal, discountAmount, taxAmount, total } = calculateInvoiceTotal();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`;
    
    const newInvoice = {
      id: invoiceNumber,
      ...formData,
      subtotal,
      discount: discountAmount,
      tax: taxAmount,
      total,
      status: 'draft',
      createdAt: new Date().toISOString(),
      paidAt: null,
      paymentMethod: null
    };
    
    setInvoices(prev => [...prev, newInvoice]);
    toast.success('Invoice created successfully');
    setShowCreateModal(false);
  };

  const handleSendInvoice = (invoice) => {
    // Simulate sending invoice
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id 
        ? { ...inv, status: 'pending' }
        : inv
    ));
    toast.success(`Invoice ${invoice.id} sent to ${invoice.patientEmail}`);
  };

  const handleMarkAsPaid = (invoice) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoice.id 
        ? { 
            ...inv, 
            status: 'paid', 
            paidAt: new Date().toISOString(),
            paymentMethod: 'Manual Entry'
          }
        : inv
    ));
    toast.success(`Invoice ${invoice.id} marked as paid`);
  };

  const handleDownloadInvoice = (invoice) => {
    const content = generateInvoiceContent(invoice);
    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.id}.html`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Invoice downloaded successfully');
  };

  const generateInvoiceContent = (invoice) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .company-info { text-align: left; }
          .invoice-info { text-align: right; }
          .patient-info { margin: 40px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f8f9fa; }
          .totals { text-align: right; margin-top: 20px; }
          .total-row { font-weight: bold; font-size: 1.2em; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>${companySettings.name}</h1>
            <p>${companySettings.address}</p>
            <p>Phone: ${companySettings.phone}</p>
            <p>Email: ${companySettings.email}</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.id}</p>
            <p><strong>Date:</strong> ${new Date(invoice.createdAt).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div class="patient-info">
          <h3>Bill To:</h3>
          <p><strong>${invoice.patientName}</strong></p>
          <p>Patient ID: ${invoice.patientId}</p>
          <p>${invoice.patientAddress}</p>
          <p>Phone: ${invoice.patientPhone}</p>
          <p>Email: ${invoice.patientEmail}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.services.map(service => `
              <tr>
                <td>${service.description}</td>
                <td>${service.quantity}</td>
                <td>$${service.rate.toFixed(2)}</td>
                <td>$${service.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="totals">
          <p>Subtotal: $${invoice.subtotal.toFixed(2)}</p>
          ${invoice.discount > 0 ? `<p>Discount: -$${invoice.discount.toFixed(2)}</p>` : ''}
          ${invoice.tax > 0 ? `<p>Tax: $${invoice.tax.toFixed(2)}</p>` : ''}
          <p class="total-row">Total: $${invoice.total.toFixed(2)}</p>
        </div>
        
        ${invoice.notes ? `<div style="margin-top: 40px;"><h4>Notes:</h4><p>${invoice.notes}</p></div>` : ''}
        
        <div style="margin-top: 40px; font-size: 0.9em; color: #666;">
          <p>Payment Details:</p>
          <p>${companySettings.bankDetails}</p>
          <p>Tax ID: ${companySettings.taxId}</p>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiDollarSign className="text-green-600" />
              Invoice Management
            </h1>
            <p className="text-gray-600 mt-1">Create, manage, and track patient invoices</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSettingsModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FiSettings size={16} />
              Settings
            </Button>
            <Button
              onClick={handleCreateInvoice}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${totals.total.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiTrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">${totals.paid.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${totals.pending.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="text-yellow-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">${totals.overdue.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search invoices by ID, patient name, or patient ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
        </Card>

        {/* Invoices Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredInvoices.map((invoice) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {new Date(invoice.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.patientName}</div>
                        <div className="text-sm text-gray-500">{invoice.patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {invoice.services.length} service(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getStatusBadgeColor(invoice.status)}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        {invoice.status === 'overdue' && (
                          <div className="text-sm text-red-600">
                            Overdue
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowPreviewModal(true);
                            }}
                          >
                            <FiEye size={14} />
                          </Button>
                          {invoice.status === 'draft' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSendInvoice(invoice)}
                              className="text-blue-600 hover:bg-blue-50"
                            >
                              <FiSend size={14} />
                            </Button>
                          )}
                          {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(invoice)}
                              className="text-green-600 hover:bg-green-50"
                            >
                              <FiCheckCircle size={14} />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadInvoice(invoice)}
                          >
                            <FiDownload size={14} />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create Invoice Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Invoice</h2>
                
                <form onSubmit={handleSubmitInvoice} className="space-y-6">
                  {/* Patient Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient ID
                        </label>
                        <Input
                          value={formData.patientId}
                          onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                          placeholder="Enter patient ID"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient Name
                        </label>
                        <Input
                          value={formData.patientName}
                          onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                          placeholder="Enter patient name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={formData.patientEmail}
                          onChange={(e) => setFormData({...formData, patientEmail: e.target.value})}
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <Input
                          value={formData.patientPhone}
                          onChange={(e) => setFormData({...formData, patientPhone: e.target.value})}
                          placeholder="Enter phone number"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <Input
                          value={formData.patientAddress}
                          onChange={(e) => setFormData({...formData, patientAddress: e.target.value})}
                          placeholder="Enter full address"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Services</h3>
                      <Button
                        type="button"
                        onClick={handleAddService}
                        variant="outline"
                        size="sm"
                      >
                        <FiPlus size={14} />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {formData.services.map((service, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                          <div className="md:col-span-2">
                            <Input
                              placeholder="Service description"
                              value={service.description}
                              onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Qty"
                              value={service.quantity}
                              onChange={(e) => handleServiceChange(index, 'quantity', parseInt(e.target.value) || 0)}
                              min="1"
                              required
                            />
                          </div>
                          <div>
                            <Input
                              type="number"
                              placeholder="Rate"
                              value={service.rate}
                              onChange={(e) => handleServiceChange(index, 'rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              required
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">${service.amount.toFixed(2)}</span>
                            {formData.services.length > 1 && (
                              <Button
                                type="button"
                                onClick={() => handleRemoveService(index)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount (%)
                        </label>
                        <Input
                          type="number"
                          value={formData.discount}
                          onChange={(e) => setFormData({...formData, discount: parseFloat(e.target.value) || 0})}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tax (%)
                        </label>
                        <Input
                          type="number"
                          value={formData.tax}
                          onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Due Date
                        </label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes or terms"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Total Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-right space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateInvoiceTotal().subtotal.toFixed(2)}</span>
                      </div>
                      {formData.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount ({formData.discount}%):</span>
                          <span>-${calculateInvoiceTotal().discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      {formData.tax > 0 && (
                        <div className="flex justify-between">
                          <span>Tax ({formData.tax}%):</span>
                          <span>${calculateInvoiceTotal().taxAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>${calculateInvoiceTotal().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Invoice
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invoice Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Invoice Preview</h2>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadInvoice(selectedInvoice)}
                      variant="outline"
                    >
                      <FiDownload size={16} />
                    </Button>
                    <Button
                      onClick={() => setShowPreviewModal(false)}
                      variant="outline"
                    >
                      Close
                    </Button>
                  </div>
                </div>
                
                <div 
                  className="border rounded-lg p-6"
                  dangerouslySetInnerHTML={{ __html: generateInvoiceContent(selectedInvoice) }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-2xl"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Invoice Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      value={companySettings.name}
                      onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bank Details
                    </label>
                    <Input
                      value={companySettings.bankDetails}
                      onChange={(e) => setCompanySettings({...companySettings, bankDetails: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax ID
                    </label>
                    <Input
                      value={companySettings.taxId}
                      onChange={(e) => setCompanySettings({...companySettings, taxId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettingsModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success('Settings saved successfully');
                      setShowSettingsModal(false);
                    }}
                  >
                    Save Settings
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default InvoiceManagement;