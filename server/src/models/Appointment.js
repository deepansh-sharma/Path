import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  patientInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', 'other'] }
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  timeSlot: {
    start: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
    },
    end: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format. Use HH:MM']
    }
  },
  type: {
    type: String,
    enum: ['sample_collection', 'consultation', 'report_discussion', 'follow_up', 'emergency'],
    required: true,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal',
    index: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
    default: 'scheduled',
    index: true
  },
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    name: { type: String, required: true },
    code: { type: String },
    price: { type: Number, min: 0 },
    preparation: { type: String },
    estimatedDuration: { type: Number } // in minutes
  }],
  assignedStaff: {
    primary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    secondary: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  department: {
    type: String,
    required: true,
    enum: ['hematology', 'biochemistry', 'microbiology', 'pathology', 'radiology', 'cardiology', 'general']
  },
  room: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: [15, 'Minimum appointment duration is 15 minutes'],
    max: [480, 'Maximum appointment duration is 8 hours']
  },
  notes: {
    patient: { type: String, maxlength: [500, 'Patient notes cannot exceed 500 characters'] },
    staff: { type: String, maxlength: [1000, 'Staff notes cannot exceed 1000 characters'] },
    preparation: { type: String, maxlength: [500, 'Preparation notes cannot exceed 500 characters'] }
  },
  referral: {
    doctor: {
      name: { type: String },
      contact: { type: String },
      hospital: { type: String }
    },
    referenceNumber: { type: String }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    amount: {
      total: { type: Number, min: 0, default: 0 },
      paid: { type: Number, min: 0, default: 0 },
      pending: { type: Number, min: 0, default: 0 }
    },
    paidAt: { type: Date },
    method: {
      type: String,
      enum: ['cash', 'card', 'upi', 'bank_transfer', 'insurance']
    },
    transactionId: { type: String }
  },
  reminders: {
    sent: [{
      type: {
        type: String,
        enum: ['sms', 'email', 'whatsapp', 'call']
      },
      sentAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['sent', 'delivered', 'failed'],
        default: 'sent'
      }
    }],
    nextReminder: { type: Date }
  },
  followUp: {
    required: { type: Boolean, default: false },
    scheduledDate: { type: Date },
    notes: { type: String }
  },
  cancellation: {
    reason: { type: String },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: { type: Date },
    refundAmount: { type: Number, min: 0 }
  },
  rescheduling: {
    originalDate: { type: Date },
    originalTimeSlot: {
      start: { type: String },
      end: { type: String }
    },
    reason: { type: String },
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescheduledAt: { type: Date }
  },
  checkIn: {
    time: { type: Date },
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: { type: String, maxlength: 500 }
  },
  checkOut: {
    time: { type: Date },
    checkedOutBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: { type: String, maxlength: 500 }
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

// Compound indexes for better query performance
appointmentSchema.index({ labId: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ labId: 1, 'assignedStaff.primary': 1, appointmentDate: 1 });
appointmentSchema.index({ labId: 1, department: 1, appointmentDate: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentId: 1, labId: 1 });

// Virtual for appointment duration in hours
appointmentSchema.virtual('durationHours').get(function() {
  return this.duration / 60;
});

// Virtual for appointment status color
appointmentSchema.virtual('statusColor').get(function() {
  const colors = {
    scheduled: '#3B82F6',
    confirmed: '#10B981',
    in_progress: '#F59E0B',
    completed: '#059669',
    cancelled: '#EF4444',
    no_show: '#6B7280',
    rescheduled: '#8B5CF6'
  };
  return colors[this.status] || '#6B7280';
});

// Virtual for total test cost
appointmentSchema.virtual('totalTestCost').get(function() {
  return this.tests.reduce((total, test) => total + (test.price || 0), 0);
});

// Method to generate appointment ID
appointmentSchema.statics.generateAppointmentId = async function(labId) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  const count = await this.countDocuments({
    labId,
    createdAt: {
      $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    }
  });
  
  return `APT${dateStr}${String(count + 1).padStart(3, '0')}`;
};

// Method to check availability
appointmentSchema.statics.checkAvailability = async function(labId, date, timeSlot, room, excludeId = null) {
  const query = {
    labId,
    appointmentDate: date,
    room,
    status: { $nin: ['cancelled', 'no_show'] },
    $or: [
      {
        'timeSlot.start': { $lt: timeSlot.end },
        'timeSlot.end': { $gt: timeSlot.start }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  const conflicting = await this.findOne(query);
  return !conflicting;
};

// Method to reschedule appointment
appointmentSchema.methods.reschedule = function(newDate, newTimeSlot, reason, rescheduledBy) {
  this.rescheduling = {
    originalDate: this.appointmentDate,
    originalTimeSlot: { ...this.timeSlot },
    reason,
    rescheduledBy,
    rescheduledAt: new Date()
  };
  
  this.appointmentDate = newDate;
  this.timeSlot = newTimeSlot;
  this.status = 'rescheduled';
  
  return this.save();
};

// Method to cancel appointment
appointmentSchema.methods.cancel = function(reason, cancelledBy, refundAmount = 0) {
  this.status = 'cancelled';
  this.cancellation = {
    reason,
    cancelledBy,
    cancelledAt: new Date(),
    refundAmount
  };
  
  return this.save();
};

// Method to check in patient
appointmentSchema.methods.performCheckIn = function(checkedInBy, notes = '') {
  this.checkIn = {
    time: new Date(),
    checkedInBy: checkedInBy,
    notes
  };
  this.status = 'in_progress';
  this.updatedBy = checkedInBy;
  return this.save();
};

// Method to check out patient
appointmentSchema.methods.performCheckOut = function(checkedOutBy, notes = '', paymentStatus = null) {
  this.checkOut = {
    time: new Date(),
    checkedOutBy: checkedOutBy,
    notes
  };
  this.status = 'completed';
  
  if (paymentStatus) {
    this.payment.status = paymentStatus;
    this.payment.paidAt = new Date();
  }
  
  this.updatedBy = checkedOutBy;
  return this.save();
};

// Pre-save middleware
appointmentSchema.pre('save', async function(next) {
  // Generate appointment ID if not exists
  if (this.isNew && !this.appointmentId) {
    this.appointmentId = await this.constructor.generateAppointmentId(this.labId);
  }
  
  // Calculate total payment amount
  if (this.tests && this.tests.length > 0) {
    this.payment.amount.total = this.totalTestCost;
    this.payment.amount.pending = this.payment.amount.total - this.payment.amount.paid;
  }
  
  next();
});

export default mongoose.model('Appointment', appointmentSchema);