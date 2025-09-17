import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['super_admin', 'lab_admin', 'technician', 'receptionist', 'finance'],
    required: [true, 'Role is required']
  },
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: function() {
      return this.role !== 'super_admin';
    }
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  permissions: {
    patients: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    samples: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    reports: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    invoices: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    staff: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    },
    analytics: {
      read: { type: Boolean, default: false }
    }
  },
  lastLogin: {
    type: Date
  },
  profileImage: {
    type: String
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Set default permissions based on role
userSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('role')) {
    switch (this.role) {
      case 'super_admin':
        Object.keys(this.permissions).forEach(module => {
          if (typeof this.permissions[module] === 'object') {
            Object.keys(this.permissions[module]).forEach(action => {
              this.permissions[module][action] = true;
            });
          }
        });
        break;
      
      case 'lab_admin':
        Object.keys(this.permissions).forEach(module => {
          if (typeof this.permissions[module] === 'object') {
            Object.keys(this.permissions[module]).forEach(action => {
              this.permissions[module][action] = true;
            });
          }
        });
        break;
      
      case 'technician':
        this.permissions.samples = { create: true, read: true, update: true, delete: false };
        this.permissions.reports = { create: true, read: true, update: true, delete: false };
        this.permissions.patients = { create: false, read: true, update: false, delete: false };
        break;
      
      case 'receptionist':
        this.permissions.patients = { create: true, read: true, update: true, delete: false };
        this.permissions.samples = { create: true, read: true, update: false, delete: false };
        this.permissions.invoices = { create: true, read: true, update: true, delete: false };
        break;
      
      case 'finance':
        this.permissions.invoices = { create: true, read: true, update: true, delete: false };
        this.permissions.analytics = { read: true };
        this.permissions.patients = { create: false, read: true, update: false, delete: false };
        break;
    }
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Check if user has permission
userSchema.methods.hasPermission = function(module, action) {
  if (this.role === 'super_admin') return true;
  return this.permissions[module] && this.permissions[module][action];
};

export default mongoose.model('User', userSchema);
