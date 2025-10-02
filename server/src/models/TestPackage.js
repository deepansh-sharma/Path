import mongoose from "mongoose";

// Test Package Schema for bundling multiple tests with discounted pricing
const testPackageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: [
        "general_health",
        "cardiac_profile",
        "diabetes_profile",
        "liver_profile",
        "kidney_profile",
        "thyroid_profile",
        "lipid_profile",
        "anemia_profile",
        "infection_profile",
        "cancer_screening",
        "pregnancy_profile",
        "geriatric_profile",
        "pediatric_profile",
        "pre_employment",
        "annual_checkup",
        "custom",
        "other",
      ],
      required: true,
      index: true,
    },
    
    // Tests included in the package
    tests: [{
      testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Test",
        required: true,
      },
      isOptional: {
        type: Boolean,
        default: false,
      },
      customPrice: {
        type: Number,
        min: 0,
      },
    }],

    // Pricing Information
    pricing: {
      totalIndividualPrice: {
        type: Number,
        required: true,
        min: 0,
      },
      packagePrice: {
        type: Number,
        required: true,
        min: 0,
      },
      discountAmount: {
        type: Number,
        min: 0,
      },
      discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
      },
      currency: {
        type: String,
        default: "INR",
      },
      priceHistory: [{
        packagePrice: { type: Number, required: true },
        discountPercentage: { type: Number },
        effectiveDate: { type: Date, default: Date.now },
        reason: { type: String },
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      }],
    },

    // Package Status and Availability
    status: {
      type: String,
      enum: ["active", "inactive", "discontinued", "under_review"],
      default: "active",
      index: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    availabilitySchedule: {
      days: [{
        type: String,
        enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      }],
      timeSlots: [{
        start: { type: String }, // HH:MM format
        end: { type: String },   // HH:MM format
      }],
    },

    // Target Demographics
    targetDemographics: {
      ageGroups: [{
        type: String,
        enum: ["pediatric", "adult", "geriatric", "all"],
      }],
      gender: {
        type: String,
        enum: ["male", "female", "both"],
        default: "both",
      },
      conditions: [{ type: String }], // Target conditions or health concerns
    },

    // Package Instructions and Requirements
    instructions: {
      prePackage: { type: String }, // Instructions before package
      postPackage: { type: String }, // Instructions after package
      patientInstructions: { type: String }, // Instructions for patient
      fastingRequired: {
        type: Boolean,
        default: false,
      },
      fastingDuration: {
        hours: { type: Number, default: 0 },
        instructions: { type: String },
      },
    },

    // Turnaround Time
    turnaroundTime: {
      routine: {
        duration: { type: Number, required: true },
        unit: {
          type: String,
          enum: ["hours", "days"],
          default: "days",
        },
      },
      urgent: {
        duration: { type: Number },
        unit: {
          type: String,
          enum: ["hours", "days"],
          default: "hours",
        },
        additionalCost: { type: Number, default: 0 },
      },
    },

    // Marketing and Promotion
    promotion: {
      isPromoted: { type: Boolean, default: false },
      promotionText: { type: String },
      validFrom: { type: Date },
      validUntil: { type: Date },
      maxOrders: { type: Number },
      currentOrders: { type: Number, default: 0 },
    },

    // Statistics and Analytics
    statistics: {
      totalOrders: { type: Number, default: 0 },
      completedPackages: { type: Number, default: 0 },
      averageTurnaroundTime: { type: Number, default: 0 },
      popularityScore: { type: Number, default: 0 },
      lastOrderDate: { type: Date },
      revenue: { type: Number, default: 0 },
    },

    // Metadata
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    keywords: [{
      type: String,
      trim: true,
      lowercase: true,
    }],

    // Lab and User References
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
testPackageSchema.index({ labId: 1, category: 1 });
testPackageSchema.index({ labId: 1, status: 1 });
testPackageSchema.index({ labId: 1, name: "text", code: "text", description: "text" });
testPackageSchema.index({ "pricing.packagePrice": 1 });
testPackageSchema.index({ "statistics.popularityScore": -1 });
testPackageSchema.index({ "promotion.isPromoted": 1, "promotion.validFrom": 1, "promotion.validUntil": 1 });

// Virtual for savings amount
testPackageSchema.virtual('savingsAmount').get(function() {
  return this.pricing.totalIndividualPrice - this.pricing.packagePrice;
});

// Virtual for savings percentage
testPackageSchema.virtual('savingsPercentage').get(function() {
  if (this.pricing.totalIndividualPrice > 0) {
    return Math.round(((this.pricing.totalIndividualPrice - this.pricing.packagePrice) / this.pricing.totalIndividualPrice) * 100);
  }
  return 0;
});

// Virtual for test count
testPackageSchema.virtual('testCount').get(function() {
  return this.tests.length;
});

// Virtual for promotion status
testPackageSchema.virtual('isPromotionActive').get(function() {
  if (!this.promotion.isPromoted) return false;
  
  const now = new Date();
  const validFrom = this.promotion.validFrom || new Date(0);
  const validUntil = this.promotion.validUntil || new Date('2099-12-31');
  
  return now >= validFrom && now <= validUntil;
});

// Method to calculate total individual price
testPackageSchema.methods.calculateTotalIndividualPrice = async function() {
  await this.populate('tests.testId');
  
  let total = 0;
  for (const testItem of this.tests) {
    if (testItem.customPrice) {
      total += testItem.customPrice;
    } else if (testItem.testId && testItem.testId.pricing) {
      total += testItem.testId.pricing.basePrice;
    }
  }
  
  this.pricing.totalIndividualPrice = total;
  this.pricing.discountAmount = total - this.pricing.packagePrice;
  this.pricing.discountPercentage = total > 0 ? Math.round(((total - this.pricing.packagePrice) / total) * 100) : 0;
  
  return this.save();
};

// Method to update statistics
testPackageSchema.methods.updateStatistics = function(orderCount = 0, completedCount = 0, avgTurnaround = 0, revenue = 0) {
  this.statistics.totalOrders += orderCount;
  this.statistics.completedPackages += completedCount;
  this.statistics.revenue += revenue;
  
  if (avgTurnaround > 0) {
    this.statistics.averageTurnaroundTime = avgTurnaround;
  }
  this.statistics.lastOrderDate = new Date();
  
  // Calculate popularity score based on recent orders and completion rate
  const completionRate = this.statistics.totalOrders > 0 ? 
    (this.statistics.completedPackages / this.statistics.totalOrders) * 100 : 0;
  this.statistics.popularityScore = (this.statistics.totalOrders * 0.6) + (completionRate * 0.3) + (this.statistics.revenue * 0.1);
  
  return this.save();
};

// Method to update pricing with history
testPackageSchema.methods.updatePrice = function(newPackagePrice, reason, updatedBy) {
  // Add to price history
  this.pricing.priceHistory.push({
    packagePrice: this.pricing.packagePrice,
    discountPercentage: this.pricing.discountPercentage,
    effectiveDate: new Date(),
    reason: reason || 'Price update',
    updatedBy: updatedBy,
  });
  
  // Update current price
  this.pricing.packagePrice = newPackagePrice;
  this.pricing.discountAmount = this.pricing.totalIndividualPrice - newPackagePrice;
  this.pricing.discountPercentage = this.pricing.totalIndividualPrice > 0 ? 
    Math.round(((this.pricing.totalIndividualPrice - newPackagePrice) / this.pricing.totalIndividualPrice) * 100) : 0;
  
  this.updatedBy = updatedBy;
  
  return this.save();
};

// Method to add test to package
testPackageSchema.methods.addTest = function(testId, isOptional = false, customPrice = null) {
  // Check if test already exists in package
  const existingTest = this.tests.find(test => test.testId.toString() === testId.toString());
  if (existingTest) {
    throw new Error('Test already exists in this package');
  }
  
  this.tests.push({
    testId: testId,
    isOptional: isOptional,
    customPrice: customPrice,
  });
  
  return this.calculateTotalIndividualPrice();
};

// Method to remove test from package
testPackageSchema.methods.removeTest = function(testId) {
  this.tests = this.tests.filter(test => test.testId.toString() !== testId.toString());
  return this.calculateTotalIndividualPrice();
};

// Pre-save middleware to generate package code if not provided
testPackageSchema.pre('save', async function(next) {
  if (this.isNew && !this.code) {
    // Generate unique package code
    const categoryCode = this.category.substring(0, 3).toUpperCase();
    const count = await mongoose.model('TestPackage').countDocuments({ 
      labId: this.labId,
      category: this.category 
    });
    this.code = `PKG${categoryCode}${String(count + 1).padStart(3, '0')}`;
  }
  
  // Update the updatedBy field
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy; // This should be set by the controller
  }
  
  next();
});

export default mongoose.model("TestPackage", testPackageSchema);