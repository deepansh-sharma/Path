import mongoose from 'mongoose';

const parameterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  unit: {
    type: String,
    required: true
  },
  dataType: {
    type: String,
    enum: ['numeric', 'text', 'boolean', 'select', 'multiselect'],
    default: 'numeric'
  },
  referenceRange: {
    male: {
      min: { type: Number },
      max: { type: Number },
      text: { type: String }
    },
    female: {
      min: { type: Number },
      max: { type: Number },
      text: { type: String }
    },
    pediatric: {
      ageGroups: [{
        minAge: { type: Number }, // in months
        maxAge: { type: Number }, // in months
        min: { type: Number },
        max: { type: Number },
        text: { type: String }
      }]
    },
    general: {
      min: { type: Number },
      max: { type: Number },
      text: { type: String }
    }
  },
  criticalValues: {
    low: { type: Number },
    high: { type: Number },
    alertOnCritical: { type: Boolean, default: true }
  },
  options: [{ // For select/multiselect types
    value: { type: String },
    label: { type: String }
  }],
  formula: { // For calculated parameters
    expression: { type: String },
    dependencies: [{ type: String }] // Parameter codes this depends on
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Test name is required'],
    trim: true,
    maxlength: [200, 'Test name cannot exceed 200 characters']
  },
  code: {
    type: String,
    required: [true, 'Test code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Test code cannot exceed 20 characters']
  },
  shortName: {
    type: String,
    trim: true,
    maxlength: [50, 'Short name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'molecular', 
           'histopathology', 'cytology', 'serology', 'endocrinology', 'toxicology', 
           'genetics', 'coagulation', 'urinalysis', 'other'],
    index: true
  },
  department: {
    type: String,
    required: true,
    enum: ['hematology', 'biochemistry', 'microbiology', 'pathology', 'radiology', 
           'cardiology', 'immunology', 'molecular', 'general'],
    index: true
  },
  type: {
    type: String,
    enum: ['profile', 'single', 'panel', 'culture', 'biopsy', 'imaging'],
    default: 'single',
    index: true
  },
  methodology: {
    type: String,
    enum: ['automated', 'manual', 'semi_automated', 'molecular', 'microscopy', 
           'culture', 'immunoassay', 'chromatography', 'spectroscopy', 'other']
  },
  specimen: {
    type: {
      type: String,
      required: true,
      enum: ['blood', 'serum', 'plasma', 'urine', 'stool', 'csf', 'sputum', 
             'tissue', 'swab', 'fluid', 'other']
    },
    volume: {
      amount: { type: Number },
      unit: { type: String, enum: ['ml', 'ul', 'drops'] }
    },
    container: {
      type: String,
      enum: ['edta', 'plain', 'fluoride', 'citrate', 'heparin', 'sterile', 'other']
    },
    collection: {
      method: { type: String },
      instructions: { type: String },
      fastingRequired: { type: Boolean, default: false },
      fastingHours: { type: Number }
    },
    storage: {
      temperature: {
        type: String,
        enum: ['room_temp', 'refrigerated', 'frozen', 'dry_ice']
      },
      stability: {
        duration: { type: Number }, // in hours
        conditions: { type: String }
      }
    }
  },
  parameters: [parameterSchema],
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'INR', 'GBP']
    },
    discounts: [{
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: { type: Number },
      condition: { type: String }, // e.g., 'bulk_order', 'insurance'
      minQuantity: { type: Number }
    }],
    insurance: {
      covered: { type: Boolean, default: false },
      copay: { type: Number },
      preAuthRequired: { type: Boolean, default: false }
    }
  },
  turnaroundTime: {
    routine: {
      duration: { type: Number, required: true }, // in hours
      unit: { type: String, default: 'hours' }
    },
    urgent: {
      duration: { type: Number },
      unit: { type: String, default: 'hours' },
      surcharge: { type: Number, default: 0 }
    },
    stat: {
      duration: { type: Number },
      unit: { type: String, default: 'minutes' },
      surcharge: { type: Number, default: 0 }
    }
  },
  equipment: [{
    name: { type: String },
    model: { type: String },
    required: { type: Boolean, default: false }
  }],
  reagents: [{
    name: { type: String },
    quantity: { type: Number },
    unit: { type: String },
    costPerTest: { type: Number }
  }],
  qualityControl: {
    required: { type: Boolean, default: true },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'per_batch'],
      default: 'daily'
    },
    controls: [{
      level: {
        type: String,
        enum: ['low', 'normal', 'high', 'critical']
      },
      expectedValue: { type: Number },
      tolerance: { type: Number }
    }]
  },
  interpretation: {
    guidelines: { type: String },
    clinicalSignificance: { type: String },
    limitations: { type: String },
    interferences: [{ type: String }]
  },
  reporting: {
    template: { type: String },
    format: {
      type: String,
      enum: ['tabular', 'narrative', 'graphical', 'combined'],
      default: 'tabular'
    },
    includeReference: { type: Boolean, default: true },
    includeInterpretation: { type: Boolean, default: false },
    autoApproval: {
      enabled: { type: Boolean, default: false },
      conditions: [{ type: String }]
    }
  },
  workflow: {
    steps: [{
      name: { type: String, required: true },
      description: { type: String },
      estimatedTime: { type: Number }, // in minutes
      assignedRole: {
        type: String,
        enum: ['technician', 'lab_admin', 'pathologist', 'any']
      },
      required: { type: Boolean, default: true },
      order: { type: Number, required: true }
    }],
    approvalRequired: {
      technician: { type: Boolean, default: true },
      pathologist: { type: Boolean, default: false },
      labAdmin: { type: Boolean, default: false }
    }
  },
  compliance: {
    regulations: [{
      type: String,
      enum: ['CAP', 'CLIA', 'ISO_15189', 'FDA', 'LOCAL']
    }],
    accreditation: {
      required: { type: Boolean, default: false },
      body: { type: String },
      validUntil: { type: Date }
    },
    proficiencyTesting: {
      required: { type: Boolean, default: false },
      provider: { type: String },
      frequency: { type: String }
    }
  },
  statistics: {
    totalOrders: { type: Number, default: 0 },
    monthlyOrders: { type: Number, default: 0 },
    averageTAT: { type: Number, default: 0 }, // in hours
    qualityMetrics: {
      accuracy: { type: Number },
      precision: { type: Number },
      errorRate: { type: Number, default: 0 }
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isOutsourced: {
    type: Boolean,
    default: false
  },
  outsourceProvider: {
    name: { type: String },
    contact: { type: String },
    tat: { type: Number }, // in hours
    cost: { type: Number }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
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
testSchema.index({ labId: 1, category: 1 });
testSchema.index({ labId: 1, department: 1 });
testSchema.index({ labId: 1, type: 1 });
testSchema.index({ labId: 1, isActive: 1 });
testSchema.index({ code: 1, labId: 1 });
testSchema.index({ name: 'text', shortName: 'text', description: 'text' });

// Virtual for formatted price
testSchema.virtual('formattedPrice').get(function() {
  const symbols = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£'
  };
  const symbol = symbols[this.pricing.currency] || this.pricing.currency;
  return `${symbol}${this.pricing.basePrice.toFixed(2)}`;
});

// Virtual for parameter count
testSchema.virtual('parameterCount').get(function() {
  return this.parameters.length;
});

// Method to calculate total cost including reagents
testSchema.methods.calculateTotalCost = function() {
  const reagentCost = this.reagents.reduce((total, reagent) => {
    return total + (reagent.costPerTest || 0);
  }, 0);
  
  return this.pricing.basePrice + reagentCost;
};

// Method to get reference range for specific patient
testSchema.methods.getReferenceRange = function(parameterCode, patientAge, patientGender) {
  const parameter = this.parameters.find(p => p.code === parameterCode);
  if (!parameter || !parameter.referenceRange) return null;
  
  // Check pediatric ranges first
  if (patientAge < 18 && parameter.referenceRange.pediatric) {
    const ageInMonths = patientAge * 12;
    const ageGroup = parameter.referenceRange.pediatric.ageGroups.find(group => 
      ageInMonths >= group.minAge && ageInMonths <= group.maxAge
    );
    if (ageGroup) return ageGroup;
  }
  
  // Check gender-specific ranges
  if (patientGender && parameter.referenceRange[patientGender]) {
    return parameter.referenceRange[patientGender];
  }
  
  // Return general range
  return parameter.referenceRange.general;
};

// Method to check if result is critical
testSchema.methods.isCriticalValue = function(parameterCode, value) {
  const parameter = this.parameters.find(p => p.code === parameterCode);
  if (!parameter || !parameter.criticalValues) return false;
  
  const { low, high } = parameter.criticalValues;
  return (low !== undefined && value < low) || (high !== undefined && value > high);
};

// Method to calculate estimated completion time
testSchema.methods.getEstimatedCompletionTime = function(priority = 'routine') {
  const tat = this.turnaroundTime[priority] || this.turnaroundTime.routine;
  const now = new Date();
  
  let completionTime = new Date(now);
  if (tat.unit === 'hours') {
    completionTime.setHours(completionTime.getHours() + tat.duration);
  } else if (tat.unit === 'minutes') {
    completionTime.setMinutes(completionTime.getMinutes() + tat.duration);
  } else if (tat.unit === 'days') {
    completionTime.setDate(completionTime.getDate() + tat.duration);
  }
  
  return completionTime;
};

// Method to update statistics
testSchema.methods.updateStatistics = function(actualTAT) {
  this.statistics.totalOrders += 1;
  this.statistics.monthlyOrders += 1;
  
  // Update average TAT
  if (actualTAT) {
    const currentAvg = this.statistics.averageTAT || 0;
    const totalOrders = this.statistics.totalOrders;
    this.statistics.averageTAT = ((currentAvg * (totalOrders - 1)) + actualTAT) / totalOrders;
  }
  
  return this.save();
};

// Static method to reset monthly statistics
testSchema.statics.resetMonthlyStatistics = function(labId) {
  return this.updateMany(
    { labId },
    { $set: { 'statistics.monthlyOrders': 0 } }
  );
};

// Pre-save middleware
testSchema.pre('save', function(next) {
  // Ensure parameters are sorted by display order
  if (this.parameters && this.parameters.length > 0) {
    this.parameters.sort((a, b) => a.displayOrder - b.displayOrder);
  }
  
  // Ensure workflow steps are sorted by order
  if (this.workflow && this.workflow.steps && this.workflow.steps.length > 0) {
    this.workflow.steps.sort((a, b) => a.order - b.order);
  }
  
  next();
});

export default mongoose.model('Test', testSchema);