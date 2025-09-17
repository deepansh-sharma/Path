import mongoose from 'mongoose';

const backupJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Backup job name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    required: true,
    enum: ['full', 'incremental', 'differential', 'database_only', 'files_only'],
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'running', 'completed', 'failed', 'cancelled', 'paused'],
    default: 'scheduled',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['manual', 'daily', 'weekly', 'monthly', 'custom'],
      default: 'manual'
    },
    time: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
    },
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6 // 0 = Sunday, 6 = Saturday
    },
    dayOfMonth: {
      type: Number,
      min: 1,
      max: 31
    },
    cronExpression: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          // Basic cron validation (5 fields)
          const cronRegex = /^(\*|([0-5]?\d)) (\*|([01]?\d|2[0-3])) (\*|([0-2]?\d|3[01])) (\*|([0]?\d|1[0-2])) (\*|([0-6]))$/;
          return cronRegex.test(v);
        },
        message: 'Invalid cron expression'
      }
    },
    nextRun: { type: Date },
    lastRun: { type: Date },
    enabled: { type: Boolean, default: true }
  },
  source: {
    databases: [{
      name: { type: String, required: true },
      collections: [{ type: String }], // If empty, backup all collections
      size: { type: Number } // Size in bytes
    }],
    files: [{
      path: { type: String, required: true },
      pattern: { type: String }, // File pattern to match
      recursive: { type: Boolean, default: true },
      size: { type: Number } // Size in bytes
    }],
    totalSize: { type: Number, default: 0 } // Total source size in bytes
  },
  destination: {
    type: {
      type: String,
      enum: ['local', 's3', 'azure', 'gcp', 'ftp', 'sftp'],
      required: true
    },
    path: {
      type: String,
      required: true
    },
    credentials: {
      accessKey: { type: String },
      secretKey: { type: String },
      region: { type: String },
      bucket: { type: String },
      endpoint: { type: String }
    },
    retention: {
      days: { type: Number, default: 30 },
      maxBackups: { type: Number, default: 10 }
    }
  },
  compression: {
    enabled: { type: Boolean, default: true },
    algorithm: {
      type: String,
      enum: ['gzip', 'bzip2', 'lz4', 'zstd'],
      default: 'gzip'
    },
    level: {
      type: Number,
      min: 1,
      max: 9,
      default: 6
    }
  },
  encryption: {
    enabled: { type: Boolean, default: false },
    algorithm: {
      type: String,
      enum: ['AES-256', 'AES-128'],
      default: 'AES-256'
    },
    keyId: { type: String }
  },
  execution: {
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // Duration in milliseconds
    progress: {
      percentage: { type: Number, min: 0, max: 100, default: 0 },
      currentStep: { type: String },
      totalSteps: { type: Number },
      completedSteps: { type: Number, default: 0 },
      bytesProcessed: { type: Number, default: 0 },
      bytesTotal: { type: Number, default: 0 }
    },
    logs: [{
      timestamp: { type: Date, default: Date.now },
      level: {
        type: String,
        enum: ['info', 'warning', 'error', 'debug'],
        default: 'info'
      },
      message: { type: String, required: true },
      details: { type: mongoose.Schema.Types.Mixed }
    }],
    error: {
      code: { type: String },
      message: { type: String },
      stack: { type: String },
      timestamp: { type: Date }
    }
  },
  result: {
    backupFile: {
      name: { type: String },
      path: { type: String },
      size: { type: Number }, // Size in bytes
      checksum: { type: String },
      compressionRatio: { type: Number }
    },
    statistics: {
      filesBackedUp: { type: Number, default: 0 },
      foldersBackedUp: { type: Number, default: 0 },
      databasesBackedUp: { type: Number, default: 0 },
      collectionsBackedUp: { type: Number, default: 0 },
      documentsBackedUp: { type: Number, default: 0 },
      totalSize: { type: Number, default: 0 },
      compressedSize: { type: Number, default: 0 }
    },
    verification: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed', 'skipped'],
        default: 'pending'
      },
      checksumMatch: { type: Boolean },
      integrityCheck: { type: Boolean },
      verifiedAt: { type: Date }
    }
  },
  notifications: {
    onSuccess: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String }], // Email addresses
      sent: { type: Boolean, default: false }
    },
    onFailure: {
      enabled: { type: Boolean, default: true },
      recipients: [{ type: String }],
      sent: { type: Boolean, default: false }
    },
    onWarning: {
      enabled: { type: Boolean, default: false },
      recipients: [{ type: String }],
      sent: { type: Boolean, default: false }
    }
  },
  dependencies: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BackupJob'
    },
    type: {
      type: String,
      enum: ['before', 'after'],
      default: 'before'
    }
  }],
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
backupJobSchema.index({ labId: 1, status: 1 });
backupJobSchema.index({ labId: 1, type: 1 });
backupJobSchema.index({ labId: 1, 'schedule.nextRun': 1 });
backupJobSchema.index({ labId: 1, createdAt: -1 });
backupJobSchema.index({ jobId: 1, labId: 1 });

// Virtual for formatted duration
backupJobSchema.virtual('formattedDuration').get(function() {
  if (!this.execution.duration) return 'N/A';
  
  const seconds = Math.floor(this.execution.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Virtual for status color
backupJobSchema.virtual('statusColor').get(function() {
  const colors = {
    scheduled: '#3B82F6',
    running: '#F59E0B',
    completed: '#10B981',
    failed: '#EF4444',
    cancelled: '#6B7280',
    paused: '#8B5CF6'
  };
  return colors[this.status] || '#6B7280';
});

// Static method to generate job ID
backupJobSchema.statics.generateJobId = async function(labId) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    labId,
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });
  
  return `BKP${dateStr}${String(count + 1).padStart(3, '0')}`;
};

// Method to calculate next run time
backupJobSchema.methods.calculateNextRun = function() {
  if (!this.schedule.enabled || this.schedule.frequency === 'manual') {
    this.schedule.nextRun = null;
    return;
  }
  
  const now = new Date();
  let nextRun = new Date(now);
  
  switch (this.schedule.frequency) {
    case 'daily':
      if (this.schedule.time) {
        const [hours, minutes] = this.schedule.time.split(':').map(Number);
        nextRun.setHours(hours, minutes, 0, 0);
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1);
        }
      }
      break;
      
    case 'weekly':
      if (this.schedule.dayOfWeek !== undefined && this.schedule.time) {
        const [hours, minutes] = this.schedule.time.split(':').map(Number);
        const daysUntilTarget = (this.schedule.dayOfWeek - now.getDay() + 7) % 7;
        nextRun.setDate(now.getDate() + (daysUntilTarget || 7));
        nextRun.setHours(hours, minutes, 0, 0);
      }
      break;
      
    case 'monthly':
      if (this.schedule.dayOfMonth && this.schedule.time) {
        const [hours, minutes] = this.schedule.time.split(':').map(Number);
        nextRun.setDate(this.schedule.dayOfMonth);
        nextRun.setHours(hours, minutes, 0, 0);
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1);
        }
      }
      break;
  }
  
  this.schedule.nextRun = nextRun;
};

// Method to start backup job
backupJobSchema.methods.start = function() {
  this.status = 'running';
  this.execution.startTime = new Date();
  this.execution.progress.percentage = 0;
  this.execution.progress.completedSteps = 0;
  this.execution.logs = [];
  
  return this.save();
};

// Method to complete backup job
backupJobSchema.methods.complete = function(result) {
  this.status = 'completed';
  this.execution.endTime = new Date();
  this.execution.duration = this.execution.endTime - this.execution.startTime;
  this.execution.progress.percentage = 100;
  this.schedule.lastRun = new Date();
  
  if (result) {
    this.result = { ...this.result, ...result };
  }
  
  this.calculateNextRun();
  return this.save();
};

// Method to fail backup job
backupJobSchema.methods.fail = function(error) {
  this.status = 'failed';
  this.execution.endTime = new Date();
  this.execution.duration = this.execution.endTime - this.execution.startTime;
  this.execution.error = {
    code: error.code || 'UNKNOWN_ERROR',
    message: error.message,
    stack: error.stack,
    timestamp: new Date()
  };
  
  return this.save();
};

// Method to add log entry
backupJobSchema.methods.addLog = function(level, message, details = null) {
  this.execution.logs.push({
    timestamp: new Date(),
    level,
    message,
    details
  });
  
  return this.save();
};

// Method to update progress
backupJobSchema.methods.updateProgress = function(percentage, currentStep, bytesProcessed) {
  this.execution.progress.percentage = Math.min(100, Math.max(0, percentage));
  if (currentStep) this.execution.progress.currentStep = currentStep;
  if (bytesProcessed) this.execution.progress.bytesProcessed = bytesProcessed;
  
  return this.save();
};

// Pre-save middleware
backupJobSchema.pre('save', async function(next) {
  // Generate job ID if not exists
  if (this.isNew && !this.jobId) {
    this.jobId = await this.constructor.generateJobId(this.labId);
  }
  
  // Calculate next run if schedule changed
  if (this.isModified('schedule')) {
    this.calculateNextRun();
  }
  
  next();
});

export default mongoose.model('BackupJob', backupJobSchema);