import mongoose from 'mongoose';
import crypto from 'crypto';

const TestItemSchema = new mongoose.Schema({
  testCode: { type: String, required: true },
  testName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'pathology', 'radiology', 'other'],
    required: true 
  },
  price: { type: Number, required: true, min: 0 },
  normalRange: {
    min: { type: Number },
    max: { type: Number },
    unit: { type: String },
    reference: { type: String }
  },
  urgency: {
    type: String,
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  }
}, { _id: false });

const StatusLogSchema = new mongoose.Schema({
  status: { 
    type: String, 
    enum: ['collected', 'received', 'processing', 'tested', 'verified', 'report_ready', 'delivered', 'rejected'],
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: { type: String },
  location: { type: String } // Lab section where status was updated
}, { _id: false });

const SampleSchema = new mongoose.Schema({
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
  
  // Sample Identification
  sampleId: {
    type: String,
    required: true,
    unique: true
  },
  
  barcode: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Sample Details
  sampleType: {
    type: String,
    enum: ['blood', 'urine', 'stool', 'sputum', 'tissue', 'swab', 'other'],
    required: true
  },
  
  containerType: {
    type: String,
    enum: ['tube', 'bottle', 'cup', 'slide', 'other'],
    default: 'tube'
  },
  
  volume: {
    amount: { type: Number },
    unit: { type: String, default: 'ml' }
  },
  
  // Test Information
  tests: [TestItemSchema],
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Collection Details
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  collectedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  collectionSite: {
    type: String // e.g., 'left arm', 'midstream urine'
  },
  
  // Status Tracking
  currentStatus: {
    type: String,
    enum: ['collected', 'received', 'processing', 'tested', 'verified', 'report_ready', 'delivered', 'rejected'],
    default: 'collected',
    index: true
  },
  
  statusHistory: [StatusLogSchema],
  
  // Processing Details
  receivedAt: { type: Date },
  processingStartedAt: { type: Date },
  testCompletedAt: { type: Date },
  verifiedAt: { type: Date },
  reportGeneratedAt: { type: Date },
  deliveredAt: { type: Date },
  
  // Quality Control
  qualityCheck: {
    passed: { type: Boolean, default: true },
    issues: [{
      issue: { type: String },
      severity: { type: String, enum: ['low', 'medium', 'high'] },
      resolvedAt: { type: Date },
      notes: { type: String }
    }]
  },
  
  // Storage Information
  storageLocation: {
    rack: { type: String },
    position: { type: String },
    temperature: { type: Number }, // in Celsius
    conditions: { type: String } // e.g., 'refrigerated', 'frozen', 'room temperature'
  },
  
  // Priority and Urgency
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  
  expectedCompletionDate: {
    type: Date
  },
  
  // Doctor and Referral
  referringDoctor: {
    name: { type: String },
    contact: { type: String },
    hospital: { type: String }
  },
  
  // Comments and Notes
  collectionNotes: { type: String },
  processingNotes: { type: String },
  technicalNotes: { type: String },
  
  // Rejection Details (if applicable)
  rejectionReason: { type: String },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: { type: Date },
  
  // Linked Reports and Invoices
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Flags
  isUrgent: { type: Boolean, default: false },
  isRetest: { type: Boolean, default: false },
  originalSampleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sample'
  }
}, {
  timestamps: true
});

// Indexes for better performance
SampleSchema.index({ labId: 1, currentStatus: 1 });
SampleSchema.index({ labId: 1, collectedAt: -1 });
SampleSchema.index({ patientId: 1, collectedAt: -1 });
SampleSchema.index({ barcode: 1 }, { unique: true });
SampleSchema.index({ sampleId: 1 }, { unique: true });

// Pre-save middleware to generate sample ID and barcode
SampleSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      // Generate unique sample ID
      if (!this.sampleId) {
        const lab = await mongoose.model('Lab').findById(this.labId);
        if (!lab) {
          throw new Error('Lab not found');
        }
        
        const labCode = lab.name.substring(0, 3).toUpperCase();
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
        const count = await mongoose.model('Sample').countDocuments({ 
          labId: this.labId,
          createdAt: {
            $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
          }
        });
        
        this.sampleId = `${labCode}${dateStr}${String(count + 1).padStart(4, '0')}`;
      }
      
      // Generate barcode if not provided
      if (!this.barcode) {
        this.barcode = this.sampleId + crypto.randomBytes(2).toString('hex').toUpperCase();
      }
      
      // Calculate total amount from tests
      if (this.tests && this.tests.length > 0) {
        this.totalAmount = this.tests.reduce((total, test) => total + test.price, 0);
      }
      
      // Set expected completion date based on test urgency
      if (!this.expectedCompletionDate) {
        const maxUrgencyDays = this.tests.reduce((max, test) => {
          const days = test.urgency === 'stat' ? 1 : test.urgency === 'urgent' ? 2 : 3;
          return Math.max(max, days);
        }, 1);
        
        this.expectedCompletionDate = new Date(Date.now() + maxUrgencyDays * 24 * 60 * 60 * 1000);
      }
      
      // Add initial status to history
      this.statusHistory.push({
        status: this.currentStatus,
        updatedBy: this.collectedBy,
        notes: 'Sample collected',
        location: 'Collection Point'
      });
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Methods
SampleSchema.methods.updateStatus = function(newStatus, updatedBy, notes = '', location = '') {
  const previousStatus = this.currentStatus;
  this.currentStatus = newStatus;
  
  // Update timestamp fields based on status
  const now = new Date();
  switch (newStatus) {
    case 'received':
      this.receivedAt = now;
      break;
    case 'processing':
      this.processingStartedAt = now;
      break;
    case 'tested':
      this.testCompletedAt = now;
      break;
    case 'verified':
      this.verifiedAt = now;
      break;
    case 'report_ready':
      this.reportGeneratedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
  }
  
  // Add to status history
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    notes,
    location
  });
  
  return this.save();
};

SampleSchema.methods.reject = function(reason, rejectedBy) {
  this.currentStatus = 'rejected';
  this.rejectionReason = reason;
  this.rejectedBy = rejectedBy;
  this.rejectedAt = new Date();
  
  this.statusHistory.push({
    status: 'rejected',
    updatedBy: rejectedBy,
    notes: `Sample rejected: ${reason}`,
    location: 'Quality Control'
  });
  
  return this.save();
};

SampleSchema.methods.addQualityIssue = function(issue, severity, notes) {
  this.qualityCheck.issues.push({
    issue,
    severity,
    notes
  });
  
  if (severity === 'high') {
    this.qualityCheck.passed = false;
  }
  
  return this.save();
};

SampleSchema.methods.getProcessingTime = function() {
  if (this.collectedAt && this.testCompletedAt) {
    return Math.round((this.testCompletedAt - this.collectedAt) / (1000 * 60 * 60)); // in hours
  }
  return null;
};

SampleSchema.methods.isOverdue = function() {
  return this.expectedCompletionDate && new Date() > this.expectedCompletionDate && 
         !['report_ready', 'delivered', 'rejected'].includes(this.currentStatus);
};

export default mongoose.model('Sample', SampleSchema);
