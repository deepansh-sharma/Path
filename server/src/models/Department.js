import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Department name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Department code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Code cannot exceed 10 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['clinical', 'administrative', 'support', 'research'],
    default: 'clinical',
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['hematology', 'biochemistry', 'microbiology', 'pathology', 'radiology', 
           'cardiology', 'immunology', 'molecular', 'cytology', 'histopathology', 
           'administration', 'quality_control', 'reception', 'billing', 'it_support'],
    index: true
  },
  location: {
    building: { type: String },
    floor: { type: String },
    wing: { type: String },
    rooms: [{
      number: { type: String, required: true },
      name: { type: String },
      type: {
        type: String,
        enum: ['laboratory', 'office', 'storage', 'meeting', 'reception', 'other']
      },
      capacity: { type: Number },
      equipment: [{ type: String }]
    }]
  },
  staff: {
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    members: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      role: {
        type: String,
        enum: ['head', 'senior_technician', 'technician', 'junior_technician', 
               'pathologist', 'resident', 'intern', 'administrator', 'support'],
        required: true
      },
      joinDate: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true },
      permissions: {
        canApproveResults: { type: Boolean, default: false },
        canModifyTests: { type: Boolean, default: false },
        canManageInventory: { type: Boolean, default: false },
        canViewReports: { type: Boolean, default: true },
        canManageEquipment: { type: Boolean, default: false }
      }
    }],
    capacity: {
      current: { type: Number, default: 0 },
      maximum: { type: Number, required: true }
    }
  },
  workingHours: {
    monday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    saturday: {
      isOpen: { type: Boolean, default: false },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      start: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      end: { type: String, match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ },
      breaks: [{
        start: { type: String },
        end: { type: String },
        description: { type: String }
      }]
    },
    emergencyHours: {
      available: { type: Boolean, default: false },
      contact: { type: String },
      procedures: [{ type: String }]
    }
  },
  services: [{
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    turnaroundTime: {
      routine: { type: Number }, // in hours
      urgent: { type: Number },
      stat: { type: Number }
    },
    cost: { type: Number, min: 0 }
  }],
  equipment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment'
  }],
  inventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inventory'
  }],
  tests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  }],
  qualityControl: {
    policies: [{
      name: { type: String, required: true },
      description: { type: String },
      version: { type: String },
      effectiveDate: { type: Date },
      reviewDate: { type: Date },
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    procedures: [{
      name: { type: String, required: true },
      steps: [{ type: String }],
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually']
      },
      lastPerformed: { type: Date },
      nextDue: { type: Date }
    }],
    metrics: {
      errorRate: { type: Number, default: 0 },
      accuracyRate: { type: Number, default: 100 },
      turnaroundCompliance: { type: Number, default: 100 },
      customerSatisfaction: { type: Number, default: 0 }
    }
  },
  budget: {
    annual: {
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    monthly: {
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      remaining: { type: Number, default: 0 }
    },
    categories: [{
      name: {
        type: String,
        enum: ['equipment', 'reagents', 'consumables', 'maintenance', 'training', 'other']
      },
      allocated: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    }]
  },
  performance: {
    metrics: {
      dailyTestVolume: { type: Number, default: 0 },
      monthlyTestVolume: { type: Number, default: 0 },
      averageTurnaroundTime: { type: Number, default: 0 },
      qualityScore: { type: Number, default: 0 },
      efficiency: { type: Number, default: 0 },
      utilization: { type: Number, default: 0 }
    },
    targets: {
      dailyTestTarget: { type: Number, default: 0 },
      monthlyTestTarget: { type: Number, default: 0 },
      turnaroundTarget: { type: Number, default: 24 }, // in hours
      qualityTarget: { type: Number, default: 95 }, // percentage
      efficiencyTarget: { type: Number, default: 85 } // percentage
    }
  },
  compliance: {
    certifications: [{
      name: { type: String, required: true },
      issuedBy: { type: String },
      issuedDate: { type: Date },
      expiryDate: { type: Date },
      status: {
        type: String,
        enum: ['active', 'expired', 'suspended', 'pending'],
        default: 'active'
      },
      certificateNumber: { type: String }
    }],
    audits: [{
      type: {
        type: String,
        enum: ['internal', 'external', 'regulatory', 'accreditation']
      },
      auditor: { type: String },
      date: { type: Date },
      findings: [{
        category: {
          type: String,
          enum: ['major', 'minor', 'observation', 'compliant']
        },
        description: { type: String },
        correctionRequired: { type: Boolean, default: false },
        correctionDeadline: { type: Date },
        status: {
          type: String,
          enum: ['open', 'in_progress', 'closed'],
          default: 'open'
        }
      }],
      overallRating: {
        type: String,
        enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory']
      }
    }]
  },
  notifications: {
    enabled: { type: Boolean, default: true },
    channels: [{
      type: String,
      enum: ['email', 'sms', 'push', 'dashboard']
    }],
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    alerts: {
      equipmentFailure: { type: Boolean, default: true },
      inventoryLow: { type: Boolean, default: true },
      qualityIssues: { type: Boolean, default: true },
      budgetExceeded: { type: Boolean, default: true },
      certificationExpiry: { type: Boolean, default: true }
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
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
departmentSchema.index({ labId: 1, category: 1 });
departmentSchema.index({ labId: 1, type: 1 });
departmentSchema.index({ labId: 1, isActive: 1 });
departmentSchema.index({ code: 1, labId: 1 });
departmentSchema.index({ name: 'text', description: 'text' });

// Virtual for staff count
departmentSchema.virtual('staffCount').get(function() {
  return this.staff.members ? this.staff.members.filter(member => member.isActive).length : 0;
});

// Virtual for room count
departmentSchema.virtual('roomCount').get(function() {
  return this.location.rooms ? this.location.rooms.length : 0;
});

// Virtual for budget utilization
departmentSchema.virtual('budgetUtilization').get(function() {
  if (!this.budget.annual.allocated || this.budget.annual.allocated === 0) return 0;
  return (this.budget.annual.spent / this.budget.annual.allocated) * 100;
});

// Method to check if department is open
departmentSchema.methods.isOpenAt = function(date = new Date()) {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayNames[date.getDay()];
  const daySchedule = this.workingHours[dayName];
  
  if (!daySchedule || !daySchedule.isOpen) return false;
  
  const currentTime = date.toTimeString().slice(0, 5); // HH:MM format
  return currentTime >= daySchedule.start && currentTime <= daySchedule.end;
};

// Method to add staff member
departmentSchema.methods.addStaffMember = function(userId, role, permissions = {}) {
  // Check if user is already a member
  const existingMember = this.staff.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a member of this department');
  }
  
  // Check capacity
  if (this.staffCount >= this.staff.capacity.maximum) {
    throw new Error('Department has reached maximum staff capacity');
  }
  
  this.staff.members.push({
    user: userId,
    role,
    permissions: {
      canApproveResults: permissions.canApproveResults || false,
      canModifyTests: permissions.canModifyTests || false,
      canManageInventory: permissions.canManageInventory || false,
      canViewReports: permissions.canViewReports || true,
      canManageEquipment: permissions.canManageEquipment || false
    }
  });
  
  this.staff.capacity.current = this.staffCount;
  return this.save();
};

// Method to remove staff member
departmentSchema.methods.removeStaffMember = function(userId) {
  this.staff.members = this.staff.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  
  this.staff.capacity.current = this.staffCount;
  return this.save();
};

// Method to update performance metrics
departmentSchema.methods.updatePerformanceMetrics = function(metrics) {
  Object.assign(this.performance.metrics, metrics);
  
  // Calculate efficiency based on targets
  const targets = this.performance.targets;
  const current = this.performance.metrics;
  
  let efficiencyScore = 0;
  let scoreCount = 0;
  
  if (targets.dailyTestTarget > 0) {
    efficiencyScore += Math.min(100, (current.dailyTestVolume / targets.dailyTestTarget) * 100);
    scoreCount++;
  }
  
  if (targets.turnaroundTarget > 0) {
    const tatScore = Math.max(0, 100 - ((current.averageTurnaroundTime - targets.turnaroundTarget) / targets.turnaroundTarget) * 100);
    efficiencyScore += tatScore;
    scoreCount++;
  }
  
  if (scoreCount > 0) {
    this.performance.metrics.efficiency = efficiencyScore / scoreCount;
  }
  
  return this.save();
};

// Method to update budget spending
departmentSchema.methods.updateBudgetSpending = function(category, amount) {
  this.budget.annual.spent += amount;
  this.budget.annual.remaining = this.budget.annual.allocated - this.budget.annual.spent;
  
  this.budget.monthly.spent += amount;
  this.budget.monthly.remaining = this.budget.monthly.allocated - this.budget.monthly.spent;
  
  // Update category spending
  const categoryBudget = this.budget.categories.find(cat => cat.name === category);
  if (categoryBudget) {
    categoryBudget.spent += amount;
  }
  
  return this.save();
};

// Method to reset monthly metrics
departmentSchema.methods.resetMonthlyMetrics = function() {
  this.performance.metrics.monthlyTestVolume = 0;
  this.budget.monthly.spent = 0;
  this.budget.monthly.remaining = this.budget.monthly.allocated;
  
  return this.save();
};

// Static method to get department statistics
departmentSchema.statics.getDepartmentStatistics = async function(labId) {
  const pipeline = [
    { $match: { labId: new mongoose.Types.ObjectId(labId), isActive: true } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalStaff: { $sum: '$staff.capacity.current' },
        totalBudget: { $sum: '$budget.annual.allocated' },
        totalSpent: { $sum: '$budget.annual.spent' },
        avgEfficiency: { $avg: '$performance.metrics.efficiency' }
      }
    },
    { $sort: { count: -1 } }
  ];
  
  return this.aggregate(pipeline);
};

// Pre-save middleware
departmentSchema.pre('save', function(next) {
  // Update current staff count
  this.staff.capacity.current = this.staffCount;
  
  // Update budget remaining
  this.budget.annual.remaining = this.budget.annual.allocated - this.budget.annual.spent;
  this.budget.monthly.remaining = this.budget.monthly.allocated - this.budget.monthly.spent;
  
  next();
});

export default mongoose.model('Department', departmentSchema);