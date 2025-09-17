import mongoose from 'mongoose';

const maintenanceRecordSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['preventive', 'corrective', 'calibration', 'inspection'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  performedBy: {
    internal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    external: {
      company: { type: String },
      technician: { type: String },
      contact: { type: String }
    }
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'scheduled'
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  attachments: [{
    filename: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { _id: true, timestamps: true });

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  model: {
    type: String,
    required: [true, 'Model is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['analyzer', 'microscope', 'centrifuge', 'incubator', 'autoclave', 'refrigerator', 'computer', 'printer', 'other'],
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    department: { type: String, required: true },
    room: { type: String },
    position: { type: String }
  },
  status: {
    type: String,
    enum: ['operational', 'maintenance', 'repair', 'calibration', 'retired', 'out_of_order'],
    default: 'operational',
    index: true
  },
  purchaseInfo: {
    date: { type: Date },
    cost: { type: Number, min: 0 },
    vendor: { type: String },
    warrantyExpiry: { type: Date },
    invoiceNumber: { type: String }
  },
  specifications: {
    powerRequirement: { type: String },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: 'cm' }
    },
    weight: {
      value: { type: Number },
      unit: { type: String, default: 'kg' }
    },
    operatingConditions: {
      temperature: {
        min: { type: Number },
        max: { type: Number },
        unit: { type: String, default: 'C' }
      },
      humidity: {
        min: { type: Number },
        max: { type: Number }
      }
    }
  },
  maintenance: {
    schedule: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual'],
        default: 'monthly'
      },
      nextDue: { type: Date },
      lastPerformed: { type: Date }
    },
    records: [maintenanceRecordSchema]
  },
  calibration: {
    required: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['monthly', 'quarterly', 'semi_annual', 'annual']
    },
    nextDue: { type: Date },
    lastPerformed: { type: Date },
    certificate: {
      number: { type: String },
      issuedBy: { type: String },
      validUntil: { type: Date }
    }
  },
  usage: {
    totalHours: { type: Number, default: 0 },
    averageDaily: { type: Number, default: 0 },
    lastUsed: { type: Date }
  },
  alerts: {
    maintenanceDue: { type: Boolean, default: false },
    calibrationDue: { type: Boolean, default: false },
    warrantyExpiring: { type: Boolean, default: false },
    outOfOrder: { type: Boolean, default: false }
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
equipmentSchema.index({ labId: 1, category: 1 });
equipmentSchema.index({ labId: 1, status: 1 });
equipmentSchema.index({ labId: 1, 'maintenance.schedule.nextDue': 1 });
equipmentSchema.index({ labId: 1, 'calibration.nextDue': 1 });
equipmentSchema.index({ serialNumber: 1, labId: 1 });

// Virtual for maintenance status
equipmentSchema.virtual('maintenanceStatus').get(function() {
  if (!this.maintenance.schedule.nextDue) return 'no_schedule';
  
  const now = new Date();
  const daysUntilDue = Math.ceil((this.maintenance.schedule.nextDue - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due_soon';
  return 'scheduled';
});

// Virtual for calibration status
equipmentSchema.virtual('calibrationStatus').get(function() {
  if (!this.calibration.required || !this.calibration.nextDue) return 'not_required';
  
  const now = new Date();
  const daysUntilDue = Math.ceil((this.calibration.nextDue - now) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 14) return 'due_soon';
  return 'valid';
});

// Method to schedule maintenance
equipmentSchema.methods.scheduleMaintenance = function(maintenanceData) {
  this.maintenance.records.push(maintenanceData);
  
  // Update next due date based on frequency
  if (this.maintenance.schedule.frequency) {
    const frequencyDays = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      semi_annual: 180,
      annual: 365
    };
    
    const days = frequencyDays[this.maintenance.schedule.frequency];
    this.maintenance.schedule.nextDue = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  }
  
  return this.save();
};

// Method to complete maintenance
equipmentSchema.methods.completeMaintenance = function(recordId, completionData) {
  const record = this.maintenance.records.id(recordId);
  if (record) {
    record.status = 'completed';
    record.completedDate = completionData.completedDate || new Date();
    record.notes = completionData.notes || record.notes;
    record.cost = completionData.cost || record.cost;
    
    this.maintenance.schedule.lastPerformed = record.completedDate;
    this.alerts.maintenanceDue = false;
  }
  
  return this.save();
};

// Method to update usage hours
equipmentSchema.methods.updateUsage = function(hours) {
  this.usage.totalHours += hours;
  this.usage.lastUsed = new Date();
  
  // Calculate average daily usage (simple moving average)
  const daysSinceCreation = Math.ceil((new Date() - this.createdAt) / (1000 * 60 * 60 * 24));
  this.usage.averageDaily = this.usage.totalHours / Math.max(1, daysSinceCreation);
  
  return this.save();
};

// Pre-save middleware to update alerts
equipmentSchema.pre('save', function(next) {
  const now = new Date();
  
  // Check maintenance due
  if (this.maintenance.schedule.nextDue) {
    const daysUntilMaintenance = Math.ceil((this.maintenance.schedule.nextDue - now) / (1000 * 60 * 60 * 24));
    this.alerts.maintenanceDue = daysUntilMaintenance <= 7;
  }
  
  // Check calibration due
  if (this.calibration.required && this.calibration.nextDue) {
    const daysUntilCalibration = Math.ceil((this.calibration.nextDue - now) / (1000 * 60 * 60 * 24));
    this.alerts.calibrationDue = daysUntilCalibration <= 14;
  }
  
  // Check warranty expiring
  if (this.purchaseInfo.warrantyExpiry) {
    const daysUntilWarrantyExpiry = Math.ceil((this.purchaseInfo.warrantyExpiry - now) / (1000 * 60 * 60 * 24));
    this.alerts.warrantyExpiring = daysUntilWarrantyExpiry <= 30 && daysUntilWarrantyExpiry > 0;
  }
  
  // Check out of order status
  this.alerts.outOfOrder = ['repair', 'out_of_order'].includes(this.status);
  
  next();
});

export default mongoose.model('Equipment', equipmentSchema);