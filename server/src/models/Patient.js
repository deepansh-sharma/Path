import mongoose from 'mongoose';

const MedicalHistorySchema = new mongoose.Schema({
  condition: { type: String, required: true },
  diagnosedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'resolved', 'chronic'], 
    default: 'active' 
  },
  notes: { type: String },
  medications: [{
    name: { type: String },
    dosage: { type: String },
    frequency: { type: String }
  }]
}, { _id: false });

const EmergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: true },
  phone: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  email: { type: String }
}, { _id: false });

const PatientSchema = new mongoose.Schema({
  // Lab association
  labId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: true,
    index: true
  },
  
  // Patient ID (auto-generated unique ID for the lab)
  patientId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Basic Information
  name: {
    type: String,
    required: [true, 'Patient name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150']
  },
  
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return value <= new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: [true, 'Gender is required']
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'],
    index: true
  },
  
  email: {
    type: String,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  // Government ID
  aadharNumber: {
    type: String,
    match: [/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number'],
    sparse: true // Allows multiple null values but unique non-null values
  },
  
  // Address
  address: {
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String },
    country: { type: String, default: 'India' }
  },
  
  // Medical Information
  medicalHistory: [MedicalHistorySchema],
  
  allergies: [{
    allergen: { type: String, required: true },
    severity: { 
      type: String, 
      enum: ['mild', 'moderate', 'severe'], 
      default: 'mild' 
    },
    notes: { type: String }
  }],
  
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Emergency Contact
  emergencyContact: EmergencyContactSchema,
  
  // Patient Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Consent and Privacy
  consentGiven: {
    type: Boolean,
    default: false
  },
  
  consentDate: {
    type: Date
  },
  
  // Analytics
  totalTests: {
    type: Number,
    default: 0
  },
  
  totalSpent: {
    type: Number,
    default: 0
  },
  
  lastVisit: {
    type: Date
  },
  
  // Notes
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for better performance
PatientSchema.index({ labId: 1, patientId: 1 });
PatientSchema.index({ labId: 1, phone: 1 });
PatientSchema.index({ labId: 1, email: 1 });
PatientSchema.index({ labId: 1, aadharNumber: 1 });

// Pre-save middleware to generate patient ID
PatientSchema.pre('save', async function(next) {
  if (this.isNew && !this.patientId) {
    try {
      const lab = await mongoose.model('Lab').findById(this.labId);
      if (!lab) {
        throw new Error('Lab not found');
      }
      
      // Generate patient ID: LAB_CODE + sequential number
      const labCode = lab.name.substring(0, 3).toUpperCase();
      const count = await mongoose.model('Patient').countDocuments({ labId: this.labId });
      this.patientId = `${labCode}${String(count + 1).padStart(6, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Calculate age from date of birth
PatientSchema.virtual('calculatedAge').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return this.age;
});

// Methods
PatientSchema.methods.updateTestCount = function() {
  this.totalTests += 1;
  this.lastVisit = new Date();
  return this.save();
};

PatientSchema.methods.updateSpentAmount = function(amount) {
  this.totalSpent += amount;
  return this.save();
};

PatientSchema.methods.addMedicalHistory = function(condition, diagnosedDate, notes) {
  this.medicalHistory.push({
    condition,
    diagnosedDate: diagnosedDate || new Date(),
    notes
  });
  return this.save();
};

PatientSchema.methods.giveConsent = function() {
  this.consentGiven = true;
  this.consentDate = new Date();
  return this.save();
};

export default mongoose.model('Patient', PatientSchema);
