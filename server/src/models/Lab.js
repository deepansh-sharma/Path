import mongoose from "mongoose";

const FeatureFlagsSchema = new mongoose.Schema(
  {
    canPatientRegistration: { type: Boolean, default: true },
    canSampleBarcodeTracking: { type: Boolean, default: true },
    canWhatsAppReportDelivery: { type: Boolean, default: false },
    canSMSNotifications: { type: Boolean, default: true },
    canEmailNotifications: { type: Boolean, default: true },
    canInvoiceManagement: { type: Boolean, default: true },
    canDoctorReviewWorkflow: { type: Boolean, default: true },
    canCustomReportTemplates: { type: Boolean, default: false },
    canAdvancedAnalytics: { type: Boolean, default: false },
    canBulkOperations: { type: Boolean, default: false },
    maxPatientsPerMonth: { type: Number, default: 100 },
    maxStaffMembers: { type: Number, default: 5 },
    maxReportTemplates: { type: Number, default: 10 }
  },
  { _id: false }
);

const SubscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: ["basic", "standard", "premium", "enterprise"],
      default: "basic",
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "pending", "overdue"],
      default: "pending",
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    trialEndDate: { type: Date },
    isTrialActive: { type: Boolean, default: true }
  },
  { _id: false }
);

const BrandingSchema = new mongoose.Schema(
  {
    logoUrl: { type: String },
    reportHeaderText: { type: String },
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#1F2937' },
    footerText: { type: String },
    digitalSignature: { type: String },
    labLicense: { type: String },
    doctorSignature: { type: String }
  },
  { _id: false }
);

const LabSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    contact: { 
      type: String, 
      required: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String },
      country: { type: String, default: 'India' }
    },
    
    // Lab specific details
    licenseNumber: { type: String, required: true, unique: true },
    establishedDate: { type: Date },
    website: { type: String },
    
    // tenancy
    tenantId: { type: String, required: true, unique: true },

    // subscription and features
    subscription: { type: SubscriptionSchema, default: () => ({}) },
    features: { type: FeatureFlagsSchema, default: () => ({}) },

    // branding
    branding: { type: BrandingSchema, default: () => ({}) },
    
    // Settings
    settings: {
      timezone: { type: String, default: 'Asia/Kolkata' },
      currency: { type: String, default: 'INR' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      reportDeliveryMethod: {
        type: [String],
        enum: ['email', 'sms', 'whatsapp', 'portal'],
        default: ['email']
      },
      autoGenerateInvoice: { type: Boolean, default: true },
      requirePatientConsent: { type: Boolean, default: true }
    },
    
    // Status
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    
    // Analytics
    analytics: {
      totalPatients: { type: Number, default: 0 },
      totalReports: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      monthlyRevenue: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Methods
LabSchema.methods.updateAnalytics = function(type, value = 1) {
  switch(type) {
    case 'patient':
      this.analytics.totalPatients += value;
      break;
    case 'report':
      this.analytics.totalReports += value;
      break;
    case 'revenue':
      this.analytics.totalRevenue += value;
      this.analytics.monthlyRevenue += value;
      break;
  }
  return this.save();
};

LabSchema.methods.resetMonthlyAnalytics = function() {
  this.analytics.monthlyRevenue = 0;
  return this.save();
};

LabSchema.methods.isFeatureEnabled = function(feature) {
  return this.features[feature] || false;
};

LabSchema.methods.isSubscriptionActive = function() {
  return this.subscription.isActive && 
         (!this.subscription.endDate || this.subscription.endDate > new Date());
};

export default mongoose.model("Lab", LabSchema);
