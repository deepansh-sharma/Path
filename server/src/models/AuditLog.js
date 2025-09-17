import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User actions
      'user_login', 'user_logout', 'user_created', 'user_updated', 'user_deleted', 'user_password_changed',
      'user_role_changed', 'user_permissions_updated', 'user_activated', 'user_deactivated',
      
      // Patient actions
      'patient_created', 'patient_updated', 'patient_deleted', 'patient_viewed', 'patient_searched',
      
      // Sample actions
      'sample_created', 'sample_updated', 'sample_deleted', 'sample_collected', 'sample_processed',
      'sample_result_entered', 'sample_result_approved', 'sample_result_rejected',
      
      // Report actions
      'report_generated', 'report_updated', 'report_deleted', 'report_viewed', 'report_downloaded',
      'report_printed', 'report_emailed', 'report_approved', 'report_rejected',
      
      // Invoice actions
      'invoice_created', 'invoice_updated', 'invoice_deleted', 'invoice_paid', 'invoice_cancelled',
      
      // Inventory actions
      'inventory_created', 'inventory_updated', 'inventory_deleted', 'inventory_stock_updated',
      'inventory_reorder', 'inventory_expired',
      
      // Equipment actions
      'equipment_created', 'equipment_updated', 'equipment_deleted', 'equipment_maintenance_scheduled',
      'equipment_maintenance_completed', 'equipment_calibrated', 'equipment_status_changed',
      
      // Appointment actions
      'appointment_created', 'appointment_updated', 'appointment_cancelled', 'appointment_rescheduled',
      'appointment_checked_in', 'appointment_checked_out', 'appointment_completed',
      
      // System actions
      'system_backup_created', 'system_backup_restored', 'system_settings_updated',
      'system_maintenance', 'system_error', 'system_startup', 'system_shutdown',
      
      // Security actions
      'security_login_failed', 'security_account_locked', 'security_password_reset',
      'security_unauthorized_access', 'security_data_export', 'security_data_import',
      
      // Compliance actions
      'compliance_report_generated', 'compliance_audit_started', 'compliance_audit_completed',
      'compliance_violation_detected', 'compliance_policy_updated'
    ],
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['user_management', 'patient_care', 'laboratory', 'financial', 'inventory', 'equipment', 
           'appointments', 'system', 'security', 'compliance', 'data_management'],
    index: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium',
    index: true
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        return !this.isSystemAction;
      }
    },
    name: { type: String },
    email: { type: String },
    role: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String }
  },
  target: {
    type: {
      type: String,
      enum: ['user', 'patient', 'sample', 'report', 'invoice', 'inventory', 'equipment', 
             'appointment', 'lab', 'system', 'file', 'database'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: function() {
        return !['system', 'file', 'database'].includes(this.target.type);
      }
    },
    name: { type: String },
    identifier: { type: String } // Could be patient ID, sample ID, etc.
  },
  description: {
    type: String,
    required: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  details: {
    before: { type: mongoose.Schema.Types.Mixed }, // State before change
    after: { type: mongoose.Schema.Types.Mixed },  // State after change
    changes: [{
      field: { type: String },
      oldValue: { type: mongoose.Schema.Types.Mixed },
      newValue: { type: mongoose.Schema.Types.Mixed }
    }],
    metadata: { type: mongoose.Schema.Types.Mixed } // Additional context
  },
  session: {
    id: { type: String },
    startTime: { type: Date },
    duration: { type: Number } // in milliseconds
  },
  request: {
    method: { type: String },
    url: { type: String },
    headers: { type: mongoose.Schema.Types.Mixed },
    body: { type: mongoose.Schema.Types.Mixed },
    query: { type: mongoose.Schema.Types.Mixed }
  },
  response: {
    statusCode: { type: Number },
    message: { type: String },
    error: { type: String }
  },
  compliance: {
    regulation: {
      type: String,
      enum: ['HIPAA', 'GDPR', 'ISO_15189', 'CAP', 'CLIA', 'FDA', 'LOCAL']
    },
    requirement: { type: String },
    status: {
      type: String,
      enum: ['compliant', 'non_compliant', 'pending_review'],
      default: 'compliant'
    }
  },
  risk: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    factors: [{ type: String }],
    mitigation: { type: String }
  },
  location: {
    department: { type: String },
    room: { type: String },
    workstation: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  isSystemAction: {
    type: Boolean,
    default: false
  },
  isAutomated: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  retention: {
    period: {
      type: Number, // in days
      default: 2555 // 7 years default
    },
    deleteAfter: { type: Date },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date }
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
auditLogSchema.index({ labId: 1, createdAt: -1 });
auditLogSchema.index({ labId: 1, action: 1, createdAt: -1 });
auditLogSchema.index({ labId: 1, category: 1, createdAt: -1 });
auditLogSchema.index({ labId: 1, severity: 1, createdAt: -1 });
auditLogSchema.index({ labId: 1, 'user.id': 1, createdAt: -1 });
auditLogSchema.index({ labId: 1, 'target.type': 1, 'target.id': 1 });
auditLogSchema.index({ labId: 1, 'compliance.status': 1 });
auditLogSchema.index({ 'retention.deleteAfter': 1 });

// Text index for search functionality
auditLogSchema.index({
  description: 'text',
  'user.name': 'text',
  'user.email': 'text',
  'target.name': 'text',
  'target.identifier': 'text'
});

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for action color based on severity
auditLogSchema.virtual('severityColor').get(function() {
  const colors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#7C2D12'
  };
  return colors[this.severity] || '#6B7280';
});

// Static method to generate log ID
auditLogSchema.statics.generateLogId = async function(labId) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    labId,
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });
  
  return `LOG${dateStr}${String(count + 1).padStart(4, '0')}`;
};

// Static method to create audit log
auditLogSchema.statics.createLog = async function(logData) {
  const log = new this({
    ...logData,
    logId: await this.generateLogId(logData.labId)
  });
  
  // Set retention delete date
  const retentionDays = log.retention.period;
  log.retention.deleteAfter = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  
  return log.save();
};

// Static method for compliance reporting
auditLogSchema.statics.getComplianceReport = async function(labId, regulation, startDate, endDate) {
  const pipeline = [
    {
      $match: {
        labId: new mongoose.Types.ObjectId(labId),
        'compliance.regulation': regulation,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$compliance.status',
        count: { $sum: 1 },
        logs: { $push: '$$ROOT' }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Static method for risk analysis
auditLogSchema.statics.getRiskAnalysis = async function(labId, timeframe = 30) {
  const startDate = new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000);
  
  const pipeline = [
    {
      $match: {
        labId: new mongoose.Types.ObjectId(labId),
        createdAt: { $gte: startDate },
        'risk.level': { $in: ['high', 'critical'] }
      }
    },
    {
      $group: {
        _id: {
          level: '$risk.level',
          category: '$category'
        },
        count: { $sum: 1 },
        latestIncident: { $max: '$createdAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];
  
  return this.aggregate(pipeline);
};

// Method to archive old logs
auditLogSchema.statics.archiveOldLogs = async function(daysOld = 365) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  return this.updateMany(
    {
      createdAt: { $lt: cutoffDate },
      'retention.archived': false
    },
    {
      $set: {
        'retention.archived': true,
        'retention.archivedAt': new Date()
      }
    }
  );
};

// Method to delete expired logs
auditLogSchema.statics.deleteExpiredLogs = async function() {
  const now = new Date();
  
  return this.deleteMany({
    'retention.deleteAfter': { $lt: now }
  });
};

// Pre-save middleware
auditLogSchema.pre('save', async function(next) {
  // Generate log ID if not exists
  if (this.isNew && !this.logId) {
    this.logId = await this.constructor.generateLogId(this.labId);
  }
  
  // Set retention delete date if not set
  if (!this.retention.deleteAfter) {
    const retentionDays = this.retention.period;
    this.retention.deleteAfter = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);
  }
  
  next();
});

export default mongoose.model('AuditLog', auditLogSchema);