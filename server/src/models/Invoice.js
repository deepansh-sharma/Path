import mongoose from 'mongoose';
import crypto from 'crypto';

const InvoiceItemSchema = new mongoose.Schema({
  testCode: { type: String, required: true },
  testName: { type: String, required: true },
  category: {
    type: String,
    enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'pathology', 'radiology', 'other'],
    required: true
  },
  description: { type: String },
  quantity: { type: Number, default: 1, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, default: 0, min: 0 },
    reason: { type: String }
  },
  discountAmount: { type: Number, default: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 }, // Tax percentage
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  sampleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sample'
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  isUrgent: { type: Boolean, default: false },
  urgentCharges: { type: Number, default: 0 }
}, { _id: false });

const PaymentSchema = new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'net_banking', 'wallet', 'cheque', 'bank_transfer', 'emi'],
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['razorpay', 'stripe', 'payu', 'cashfree', 'phonepe', 'gpay', 'paytm', 'manual']
  },
  transactionId: { type: String },
  gatewayTransactionId: { type: String },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paidAt: { type: Date },
  failureReason: { type: String },
  refundAmount: { type: Number, default: 0 },
  refundedAt: { type: Date },
  refundReason: { type: String },
  // Card/Bank Details (masked)
  cardDetails: {
    last4: { type: String },
    brand: { type: String },
    type: { type: String } // debit/credit
  },
  bankDetails: {
    bankName: { type: String },
    accountLast4: { type: String }
  },
  // UPI Details
  upiDetails: {
    vpa: { type: String },
    provider: { type: String }
  },
  // Cheque Details
  chequeDetails: {
    chequeNumber: { type: String },
    bankName: { type: String },
    chequeDate: { type: Date },
    clearanceDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'cleared', 'bounced']
    }
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: { type: String }
}, { timestamps: true });

const TaxBreakdownSchema = new mongoose.Schema({
  taxType: {
    type: String,
    enum: ['gst', 'vat', 'service_tax', 'other'],
    required: true
  },
  taxName: { type: String, required: true }, // e.g., 'CGST', 'SGST', 'IGST'
  rate: { type: Number, required: true, min: 0, max: 100 },
  amount: { type: Number, required: true, min: 0 },
  hsn: { type: String }, // HSN/SAC code
  description: { type: String }
}, { _id: false });

const InvoiceSchema = new mongoose.Schema({
  // Lab and Patient Association
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  
  // Invoice Identification
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  invoiceId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Related Documents
  sampleIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sample'
  }],
  
  reportIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  
  // Invoice Details
  invoiceDate: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  dueDate: {
    type: Date,
    required: true
  },
  
  // Items and Pricing
  items: [InvoiceItemSchema],
  
  // Amount Calculations
  subtotal: { type: Number, required: true, min: 0 },
  totalDiscount: { type: Number, default: 0, min: 0 },
  totalTax: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceAmount: { type: Number, default: 0, min: 0 },
  
  // Tax Information
  taxBreakdown: [TaxBreakdownSchema],
  taxNumber: { type: String }, // GST/VAT number
  placeOfSupply: { type: String },
  
  // Discount Information
  globalDiscount: {
    type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    value: { type: Number, default: 0, min: 0 },
    reason: { type: String },
    appliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Payment Information
  payments: [PaymentSchema],
  
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid', 'overpaid', 'refunded'],
    default: 'unpaid',
    index: true
  },
  
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net_15', 'net_30', 'net_45', 'net_60', 'custom'],
    default: 'immediate'
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft',
    index: true
  },
  
  // Customer Information (cached for performance)
  customerInfo: {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String, default: 'India' }
    },
    gstNumber: { type: String }
  },
  
  // Doctor/Referral Information
  referringDoctor: {
    name: { type: String },
    contact: { type: String },
    hospital: { type: String },
    commission: {
      type: { type: String, enum: ['percentage', 'fixed'] },
      value: { type: Number, min: 0 },
      amount: { type: Number, default: 0 }
    }
  },
  
  // Invoice Generation
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: { type: Date },
  
  // File Management
  files: [{
    type: {
      type: String,
      enum: ['pdf', 'image', 'document', 'other'],
      required: true
    },
    filename: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  pdfUrl: { type: String },
  pdfGeneratedAt: { type: Date },
  
  // Communication and Delivery
  sentAt: { type: Date },
  viewedAt: { type: Date },
  deliveryMethod: {
    type: String,
    enum: ['email', 'sms', 'whatsapp', 'print', 'portal'],
    default: 'email'
  },
  
  deliveryStatus: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  
  // Reminders and Follow-ups
  remindersSent: [{
    sentAt: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'call']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Notes and Comments
  notes: { type: String },
  internalNotes: { type: String },
  paymentInstructions: { type: String },
  
  // Cancellation and Refund
  cancellationReason: { type: String },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: { type: Date },
  
  refundDetails: {
    amount: { type: Number, default: 0 },
    reason: { type: String },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: { type: Date },
    refundMethod: {
      type: String,
      enum: ['original_payment_method', 'bank_transfer', 'cash', 'adjustment']
    }
  },
  
  // Integration and External Systems
  externalInvoiceId: { type: String },
  integrationData: {
    accounting: { // Tally, QuickBooks, etc.
      id: { type: String },
      status: { type: String },
      lastSync: { type: Date }
    },
    erp: { // ERP system integration
      id: { type: String },
      status: { type: String },
      lastSync: { type: Date }
    }
  },
  
  // Analytics and Metrics
  metrics: {
    daysToPayment: { type: Number },
    reminderCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    downloadCount: { type: Number, default: 0 }
  },
  
  // Recurring Invoice (if applicable)
  isRecurring: { type: Boolean, default: false },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly']
    },
    nextInvoiceDate: { type: Date },
    endDate: { type: Date },
    parentInvoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invoice'
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
InvoiceSchema.index({ labId: 1, paymentStatus: 1 });
InvoiceSchema.index({ labId: 1, status: 1 });
InvoiceSchema.index({ labId: 1, invoiceDate: -1 });
InvoiceSchema.index({ patientId: 1, invoiceDate: -1 });
InvoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ invoiceId: 1 }, { unique: true });
InvoiceSchema.index({ dueDate: 1, paymentStatus: 1 });

// Pre-save middleware to generate invoice ID and number
InvoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate unique invoice ID
      if (!this.invoiceId) {
        const lab = await mongoose.model('Lab').findById(this.labId);
        if (!lab) {
          throw new Error('Lab not found');
        }
        
        const labCode = lab.name.substring(0, 3).toUpperCase();
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose.model('Invoice').countDocuments({ 
          labId: this.labId,
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        });
        
        this.invoiceId = `INV${labCode}${dateStr}${String(count + 1).padStart(4, '0')}`;
      }
      
      // Generate invoice number if not provided
      if (!this.invoiceNumber) {
        this.invoiceNumber = `${this.invoiceId}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
      }
      
      // Set due date if not provided
      if (!this.dueDate) {
        const daysToAdd = this.paymentTerms === 'immediate' ? 0 : 
                         this.paymentTerms === 'net_15' ? 15 :
                         this.paymentTerms === 'net_30' ? 30 :
                         this.paymentTerms === 'net_45' ? 45 :
                         this.paymentTerms === 'net_60' ? 60 : 0;
        
        this.dueDate = new Date(this.invoiceDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
      }
      
      // Calculate amounts
      this.calculateAmounts();
      
      // Set initial metrics
      if (!this.metrics) {
        this.metrics = {
          reminderCount: 0,
          viewCount: 0,
          downloadCount: 0
        };
      }
    } catch (error) {
      return next(error);
    }
  } else {
    // Recalculate amounts on update
    this.calculateAmounts();
  }
  next();
});

// Methods
InvoiceSchema.methods.calculateAmounts = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unitPrice;
    const discountAmount = item.discount.type === 'percentage' ? 
      (itemTotal * item.discount.value / 100) : item.discount.value;
    item.discountAmount = discountAmount;
    item.totalAmount = itemTotal - discountAmount + (item.urgentCharges || 0);
    return sum + item.totalAmount;
  }, 0);
  
  // Apply global discount
  this.totalDiscount = this.globalDiscount.type === 'percentage' ? 
    (this.subtotal * this.globalDiscount.value / 100) : this.globalDiscount.value;
  
  const discountedSubtotal = this.subtotal - this.totalDiscount;
  
  // Calculate taxes
  this.totalTax = this.taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);
  
  // Calculate total
  this.totalAmount = discountedSubtotal + this.totalTax;
  
  // Calculate balance
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status
  if (this.paidAmount === 0) {
    this.paymentStatus = 'unpaid';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = this.paidAmount > this.totalAmount ? 'overpaid' : 'paid';
  } else {
    this.paymentStatus = 'partially_paid';
  }
};

InvoiceSchema.methods.addPayment = function(paymentData) {
  const payment = {
    paymentId: `PAY${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
    ...paymentData,
    paidAt: paymentData.status === 'completed' ? new Date() : null
  };
  
  this.payments.push(payment);
  
  if (payment.status === 'completed') {
    this.paidAmount += payment.amount;
    this.calculateAmounts();
    
    // Update metrics
    if (this.paymentStatus === 'paid' && !this.metrics.daysToPayment) {
      this.metrics.daysToPayment = Math.ceil((new Date() - this.invoiceDate) / (1000 * 60 * 60 * 24));
    }
  }
  
  return this.save();
};

InvoiceSchema.methods.sendReminder = function(method, sentBy) {
  this.remindersSent.push({
    method,
    status: 'sent',
    sentBy
  });
  
  this.metrics.reminderCount += 1;
  
  return this.save();
};

InvoiceSchema.methods.markAsViewed = function() {
  if (!this.viewedAt) {
    this.viewedAt = new Date();
    this.status = 'viewed';
  }
  
  this.metrics.viewCount += 1;
  
  return this.save();
};

InvoiceSchema.methods.isOverdue = function() {
  return new Date() > this.dueDate && this.paymentStatus !== 'paid';
};

InvoiceSchema.methods.getDaysOverdue = function() {
  if (!this.isOverdue()) return 0;
  return Math.ceil((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
};

InvoiceSchema.methods.cancel = function(reason, cancelledBy) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledBy = cancelledBy;
  this.cancelledAt = new Date();
  
  return this.save();
};

InvoiceSchema.methods.processRefund = function(amount, reason, processedBy, method = 'original_payment_method') {
  this.refundDetails = {
    amount,
    reason,
    processedBy,
    processedAt: new Date(),
    refundMethod: method
  };
  
  this.paidAmount -= amount;
  this.calculateAmounts();
  
  if (this.paidAmount <= 0) {
    this.paymentStatus = 'refunded';
    this.status = 'refunded';
  }
  
  return this.save();
};

export default mongoose.model('Invoice', InvoiceSchema);
