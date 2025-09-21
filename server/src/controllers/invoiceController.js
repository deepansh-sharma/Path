const Invoice = require('../models/Invoice');
const Patient = require('../models/Patient');
const { validationResult } = require('express-validator');

// Get all invoices for a lab
exports.getAllInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, patientId, paymentStatus } = req.query;
    const labId = req.user.lab || req.params.labId;
    
    const query = { lab: labId };

    if (status) {
      query.status = status;
    }

    if (patientId) {
      query.patient = patientId;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'name patientId email phone')
      .populate('createdBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      message: 'Invoices retrieved successfully',
      data: {
        invoices,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoices',
      error: error.message
    });
  }
};

// Get invoice by ID
exports.getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const invoice = await Invoice.findOne({ _id: invoiceId, lab: labId })
      .populate('patient', 'name patientId email phone address')
      .populate('createdBy', 'name email')
      .populate('lab', 'name address phone email gst');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice retrieved successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Get invoice by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice',
      error: error.message
    });
  }
};

// Create new invoice
exports.createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const labId = req.user.lab || req.params.labId;
    const invoiceData = { 
      ...req.body, 
      lab: labId,
      createdBy: req.user.id
    };

    // Generate invoice number if not provided
    if (!invoiceData.invoiceNumber) {
      const lastInvoice = await Invoice.findOne({ lab: labId }).sort({ createdAt: -1 });
      const nextNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1 : 1;
      invoiceData.invoiceNumber = `INV-${nextNumber.toString().padStart(4, '0')}`;
    }

    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const discountAmount = invoiceData.discount || 0;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = taxableAmount * (invoiceData.gstRate || 0.18);
    const totalAmount = taxableAmount + gstAmount;

    invoiceData.subtotal = subtotal;
    invoiceData.discountAmount = discountAmount;
    invoiceData.gstAmount = gstAmount;
    invoiceData.totalAmount = totalAmount;

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    // Populate the created invoice
    await invoice.populate('patient', 'name patientId email phone');
    await invoice.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { invoiceId } = req.params;
    const labId = req.user.lab || req.params.labId;
    const updateData = req.body;

    // Recalculate totals if items are updated
    if (updateData.items) {
      const subtotal = updateData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const discountAmount = updateData.discount || 0;
      const taxableAmount = subtotal - discountAmount;
      const gstAmount = taxableAmount * (updateData.gstRate || 0.18);
      const totalAmount = taxableAmount + gstAmount;

      updateData.subtotal = subtotal;
      updateData.discountAmount = discountAmount;
      updateData.gstAmount = gstAmount;
      updateData.totalAmount = totalAmount;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, lab: labId },
      updateData,
      { new: true, runValidators: true }
    ).populate('patient', 'name patientId email phone')
     .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: error.message
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const labId = req.user.lab || req.params.labId;

    const invoice = await Invoice.findOneAndDelete({ _id: invoiceId, lab: labId });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { paymentStatus, paymentMethod, paymentDate, transactionId } = req.body;
    const labId = req.user.lab || req.params.labId;

    const updateData = { paymentStatus };
    
    if (paymentStatus === 'paid') {
      updateData.paymentMethod = paymentMethod;
      updateData.paymentDate = paymentDate || new Date();
      updateData.transactionId = transactionId;
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: invoiceId, lab: labId },
      updateData,
      { new: true }
    ).populate('patient', 'name patientId email phone');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Generate invoice PDF
exports.generateInvoicePDF = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const labId = req.user.lab || req.params.labId;
    
    const invoice = await Invoice.findOne({ _id: invoiceId, lab: labId })
      .populate('patient', 'name patientId email phone address')
      .populate('lab', 'name address phone email gst logo');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Here you would integrate with PDF generation service
    // For now, returning the invoice data that would be used for PDF generation
    res.json({
      success: true,
      message: 'Invoice PDF data retrieved successfully',
      data: {
        invoice,
        pdfUrl: `/api/invoices/${invoiceId}/pdf` // This would be the actual PDF URL
      }
    });
  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice PDF',
      error: error.message
    });
  }
};

// Send invoice via email
exports.sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const { email, message } = req.body;
    const labId = req.user.lab || req.params.labId;
    
    const invoice = await Invoice.findOne({ _id: invoiceId, lab: labId })
      .populate('patient', 'name email')
      .populate('lab', 'name');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Here you would integrate with email service
    // For now, just updating the invoice to mark as sent
    await Invoice.findByIdAndUpdate(invoiceId, {
      $push: {
        emailHistory: {
          sentTo: email || invoice.patient.email,
          sentAt: new Date(),
          message: message || 'Invoice sent via email'
        }
      }
    });

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      data: {
        sentTo: email || invoice.patient.email,
        sentAt: new Date()
      }
    });
  } catch (error) {
    console.error('Send invoice email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send invoice email',
      error: error.message
    });
  }
};

// Get invoice statistics
exports.getInvoiceStats = async (req, res) => {
  try {
    const labId = req.user.lab || req.params.labId;

    const stats = await Invoice.aggregate([
      { $match: { lab: labId } },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          paidInvoices: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
          },
          pendingAmount: {
            $sum: { 
              $cond: [
                { $ne: ['$paymentStatus', 'paid'] }, 
                '$totalAmount', 
                0
              ]
            }
          },
          invoicesThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                1,
                0
              ]
            }
          },
          revenueThisMonth: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().getFullYear(), new Date().getMonth(), 1)]
                },
                '$totalAmount',
                0
              ]
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      message: 'Invoice statistics retrieved successfully',
      data: stats[0] || {
        totalInvoices: 0,
        totalRevenue: 0,
        paidInvoices: 0,
        pendingAmount: 0,
        invoicesThisMonth: 0,
        revenueThisMonth: 0
      }
    });
  } catch (error) {
    console.error('Get invoice stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve invoice statistics',
      error: error.message
    });
  }
};