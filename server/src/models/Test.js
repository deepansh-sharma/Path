import mongoose from "mongoose";

// Sub-schemas for comprehensive test management

// Reference Range Schema for parameters
const referenceRangeSchema = new mongoose.Schema({
  ageGroup: {
    type: String,
    enum: [
      "newborn",
      "infant",
      "child",
      "adolescent",
      "adult",
      "elderly",
      "all",
    ],
    default: "all",
  },
  gender: {
    type: String,
    enum: ["male", "female", "both"],
    default: "both",
  },
  condition: {
    type: String,
    enum: ["fasting", "non-fasting", "pregnancy", "normal", "all"],
    default: "all",
  },
  minValue: { type: Number },
  maxValue: { type: Number },
  unit: { type: String, required: true },
  criticalLow: { type: Number },
  criticalHigh: { type: Number },
  interpretation: {
    low: { type: String },
    normal: { type: String },
    high: { type: String },
    critical: { type: String },
  },
});

// Parameter Schema for test analytes
const parameterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  description: { type: String },
  unit: { type: String, required: true },
  dataType: {
    type: String,
    enum: ["numeric", "text", "boolean", "dropdown"],
    default: "numeric",
  },
  isCalculated: { type: Boolean, default: false },
  calculationFormula: { type: String }, // For derived values
  referenceRanges: [referenceRangeSchema],
  isRequired: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
  grouping: { type: String }, // For parameter grouping
});

// Enhanced Specimen Schema
// specimenSchema
const specimenSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "blood",
      "serum",
      "plasma",
      "whole blood",
      "urine",
      "stool",
      "sputum",
      "swab",
      "tissue",
      "csf",
      "synovial",
      "saliva",
      "bone marrow",
      "other",
    ],
    required: true,
  },
  container: {
    type: String,
    enum: [
      "vacutainer",
      "urine container",
      "stool container",
      "sputum container",
      "swab tube",
      "formalin container",
      "lavender-top tube (edta)",
      "red-top tube",
      "green-top tube",
      "blue-top tube",
      "sterile container",
      "other",
    ],
    required: true,
  },
  volume: {
    amount: { type: Number },
    unit: { type: String, enum: ["ml", "drops", "swab"], default: "ml" },
  },
  collectionInstructions: { type: String },
  preparationInstructions: { type: String },
  fastingRequired: { type: Boolean, default: false },
  fastingDuration: {
    hours: { type: Number },
    instructions: { type: String },
  },
  biohazardLevel: {
    type: String,
    enum: ["low", "medium", "high", "extreme"],
    default: "low",
  },
  storageConditions: {
    temperature: { type: String },
    duration: { type: String },
    specialRequirements: { type: String },
  },
});

// Enhanced Pricing Schema
const pricingSchema = new mongoose.Schema({
  basePrice: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  discountPrice: { type: Number },
  emergencyPrice: { type: Number },
  packagePrice: { type: Number },
  billingCode: { type: String }, // CPT, NABL, ICD codes
  insuranceCode: { type: String },
  taxInformation: {
    gst: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    otherTaxes: [
      {
        name: String,
        percentage: Number,
      },
    ],
  },
  discountEligible: { type: Boolean, default: true },
  packageEligible: { type: Boolean, default: true },
});

// Turnaround Time Schema
const turnaroundTimeSchema = new mongoose.Schema({
  routine: {
    duration: { type: Number, required: true },
    unit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      default: "hours",
    },
  },
  urgent: {
    duration: { type: Number },
    unit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      default: "hours",
    },
    additionalCost: { type: Number, default: 0 },
  },
  stat: {
    duration: { type: Number },
    unit: { type: String, enum: ["minutes", "hours"], default: "minutes" },
    additionalCost: { type: Number, default: 0 },
  },
});

// Workflow Schema
const workflowSchema = new mongoose.Schema({
  processingType: {
    type: String,
    enum: ["in-house", "outsourced", "hybrid"],
    default: "in-house",
  },
  outsourcedLab: {
    name: { type: String },
    contact: { type: String },
    cost: { type: Number },
    turnaroundTime: { type: Number },
  },
  equipmentRequired: [
    {
      name: { type: String },
      model: { type: String },
      isRequired: { type: Boolean, default: false },
    },
  ],
  reagentsRequired: [
    {
      name: { type: String },
      quantity: { type: Number },
      unit: { type: String },
      costPerUnit: { type: Number },
    },
  ],
  schedulingRestrictions: {
    availableDays: [{ type: String }], // Monday, Tuesday, etc.
    availableHours: {
      start: { type: String },
      end: { type: String },
    },
    specialRequirements: { type: String },
  },
});

// reportingSchema
const reportingSchema = new mongoose.Schema({
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "ReportTemplate" },
  customTemplate: { type: String },
  autoInterpretation: {
    enabled: { type: Boolean, default: false },
    rules: [
      {
        condition: { type: String },
        interpretation: { type: String },
        flag: {
          type: String,
          enum: ["normal", "abnormal", "critical", "high", "low"],
        },
      },
    ],
  },
  graphicalRepresentation: {
    enabled: { type: Boolean, default: false },
    chartType: { type: String, enum: ["line", "bar", "trend"] },
  },
  customComments: {
    enabled: { type: Boolean, default: true },
    defaultComments: [{ type: String }],
  },
});

// Compliance Schema
const complianceSchema = new mongoose.Schema({
  loincCode: { type: String },
  cptCode: { type: String },
  icdCode: { type: String },
  nablMapping: { type: String },
  isoMapping: { type: String },
  regulatoryFlags: [
    {
      type: { type: String }, // HIV, TB, etc.
      requiresConsent: { type: Boolean, default: false },
      requiresNotification: { type: Boolean, default: false },
      notificationAuthority: { type: String },
    },
  ],
  consentForm: {
    required: { type: Boolean, default: false },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsentTemplate",
    },
    customForm: { type: String },
  },
  qualityControl: {
    required: { type: Boolean, default: false },
    frequency: { type: String },
    standards: [{ type: String }],
  },
});

// Main Test Schema
const testSchema = new mongoose.Schema(
  {
    // Core Test Information
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    shortCode: { type: String, uppercase: true, trim: true },
    description: { type: String, trim: true },
    purpose: { type: String, trim: true },

    // Categorization
    category: {
      type: String,
      enum: [
        "single test",
        "package",
        "panel",
        "outsourced test",
        "profile",
        "screening",
        "diagnostic",
        "monitoring",
        "emergency",
      ],
      required: true,
    },
    department: {
      type: String,
      enum: [
        "hematology",
        "biochemistry",
        "serology",
        "microbiology",
        "immunology",
        "pathology",
        "cytology",
        "molecular biology",
        "genetics",
        "toxicology",
        "endocrinology",
        "cardiology",
        "oncology",
        "infectious diseases",
        "other",
      ],
      required: true,
    },

    // Test Components
    parameters: [parameterSchema],
    specimen: specimenSchema,
    pricing: pricingSchema,
    turnaroundTime: turnaroundTimeSchema,
    workflow: workflowSchema,
    reporting: reportingSchema,
    compliance: complianceSchema,

    // Status and Lifecycle
    status: {
      type: String,
      enum: ["draft", "pending_approval", "active", "inactive", "deprecated"],
      default: "draft",
    },
    approvalStatus: {
      approved: { type: Boolean, default: false },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      approvedAt: { type: Date },
      comments: { type: String },
    },

    // Version Control
    version: { type: String, default: "1.0" },
    previousVersions: [
      {
        version: { type: String },
        changes: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date },
      },
    ],

    // Package/Panel Configuration
    packageTests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
        isOptional: { type: Boolean, default: false },
        additionalCost: { type: Number, default: 0 },
      },
    ],

    // Access Control
    visibility: {
      type: String,
      enum: ["public", "private", "restricted"],
      default: "public",
    },
    restrictedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Metadata
    tags: [{ type: String, lowercase: true, trim: true }],
    keywords: [{ type: String, lowercase: true, trim: true }],
    isPopular: { type: Boolean, default: false },
    orderCount: { type: Number, default: 0 },

    // Relationships
    labId: { type: mongoose.Schema.Types.ObjectId, ref: "Lab", required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Audit Trail
    auditLog: [
      {
        action: {
          type: String,
          enum: [
            "created",
            "updated",
            "activated",
            "deactivated",
            "approved",
            "cloned",
          ],
        },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        performedAt: { type: Date, default: Date.now },
        details: { type: String },
        oldValues: { type: mongoose.Schema.Types.Mixed },
        newValues: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
testSchema.index({ labId: 1, status: 1 });
testSchema.index({ code: 1, labId: 1 }, { unique: true });
testSchema.index({ name: "text", description: "text", keywords: "text" });
testSchema.index({ department: 1, category: 1 });
testSchema.index({ "pricing.basePrice": 1 });
testSchema.index({ isPopular: -1, orderCount: -1 });

// Virtual for full test name with code
testSchema.virtual("fullName").get(function () {
  return `${this.name} (${this.code})`;
});

// Virtual for effective price (considering discounts)
testSchema.virtual("effectivePrice").get(function () {
  return this.pricing.discountPrice || this.pricing.basePrice;
});

// Pre-save middleware
testSchema.pre("save", function (next) {
  // Auto-generate short code if not provided
  if (!this.shortCode && this.code) {
    this.shortCode = this.code.substring(0, 6);
  }

  // Update audit log
  if (this.isModified() && !this.isNew) {
    this.auditLog.push({
      action: "updated",
      performedBy: this.lastModifiedBy,
      performedAt: new Date(),
      details: "Test updated",
    });
  }

  next();
});

// Static methods
testSchema.statics.findByDepartment = function (department, labId) {
  return this.find({ department, labId, status: "active" });
};

testSchema.statics.findPopular = function (labId, limit = 10) {
  return this.find({ labId, status: "active" })
    .sort({ isPopular: -1, orderCount: -1 })
    .limit(limit);
};

testSchema.statics.searchTests = function (query, labId) {
  return this.find({
    $and: [
      { labId },
      { status: "active" },
      {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { code: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { keywords: { $in: [new RegExp(query, "i")] } },
        ],
      },
    ],
  });
};

// Instance methods
testSchema.methods.clone = function (newName, newCode, userId) {
  const clonedTest = new this.constructor(this.toObject());
  clonedTest._id = new mongoose.Types.ObjectId();
  clonedTest.name = newName;
  clonedTest.code = newCode;
  clonedTest.status = "draft";
  clonedTest.version = "1.0";
  clonedTest.createdBy = userId;
  clonedTest.previousVersions = [];
  clonedTest.auditLog = [
    {
      action: "cloned",
      performedBy: userId,
      performedAt: new Date(),
      details: `Cloned from ${this.name} (${this.code})`,
    },
  ];
  clonedTest.isNew = true;
  return clonedTest;
};

testSchema.methods.approve = function (userId, comments) {
  this.approvalStatus = {
    approved: true,
    approvedBy: userId,
    approvedAt: new Date(),
    comments: comments,
  };
  this.status = "active";
  this.auditLog.push({
    action: "approved",
    performedBy: userId,
    performedAt: new Date(),
    details: comments || "Test approved",
  });
};

const Test = mongoose.model("Test", testSchema);
export default Test;
