import mongoose from "mongoose";
import crypto from "crypto";

const ResultItemSchema = new mongoose.Schema(
  {
    testCode: { type: String, required: true },
    testName: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "hematology",
        "biochemistry",
        "microbiology",
        "immunology",
        "pathology",
        "radiology",
        "other",
      ],
      required: true,
    },
    value: { type: String, required: true },
    numericValue: { type: Number }, // For calculations and trending
    unit: { type: String },
    referenceRange: {
      min: { type: Number },
      max: { type: Number },
      text: { type: String }, // For non-numeric ranges like "Negative", "Positive"
      ageGroup: { type: String },
      gender: { type: String, enum: ["male", "female", "other"] },
    },
    flag: {
      type: String,
      enum: [
        "normal",
        "low",
        "high",
        "critical_low",
        "critical_high",
        "abnormal",
        "positive",
        "negative",
      ],
      default: "normal",
    },
    interpretation: { type: String },
    methodology: { type: String },
    instrument: { type: String },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    performedAt: { type: Date, default: Date.now },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: { type: Date },
    isRetest: { type: Boolean, default: false },
    retestReason: { type: String },
    comments: { type: String },
  },
  { _id: false }
);

const ApprovalSchema = new mongoose.Schema(
  {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    level: {
      type: String,
      enum: ["technician", "senior_technician", "pathologist", "consultant"],
      required: true,
    },
    signature: {
      digital: { type: String }, // Base64 encoded signature
      certificate: { type: String }, // Digital certificate info
      timestamp: { type: Date, default: Date.now },
    },
    comments: { type: String },
  },
  { _id: false }
);

const TemplateFieldSchema = new mongoose.Schema(
  {
    fieldName: { type: String, required: true },
    fieldType: {
      type: String,
      enum: [
        "text",
        "number",
        "select",
        "multiselect",
        "textarea",
        "date",
        "image",
      ],
      required: true,
    },
    options: [String], // For select/multiselect fields
    required: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const ReportTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "hematology",
        "biochemistry",
        "microbiology",
        "immunology",
        "pathology",
        "radiology",
        "other",
      ],
      required: true,
    },
    fields: [TemplateFieldSchema],
    headerTemplate: { type: String }, // HTML template for header
    footerTemplate: { type: String }, // HTML template for footer
    bodyTemplate: { type: String }, // HTML template for body
    cssStyles: { type: String }, // Custom CSS for the template
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const QualityControlSchema = new mongoose.Schema(
  {
    controlType: {
      type: String,
      enum: ["internal", "external", "proficiency"],
      required: true,
    },
    controlId: { type: String },
    expectedValue: { type: String },
    actualValue: { type: String },
    passed: { type: Boolean, required: true },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    performedAt: { type: Date, default: Date.now },
    comments: { type: String },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    // Lab and Patient Association
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
      index: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    sampleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sample",
      required: true,
      index: true,
    },

    // Report Identification
    reportId: {
      type: String,
      required: true,
      unique: true,
    },

    reportNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Test Information
    testCategory: {
      type: String,
      enum: [
        "hematology",
        "biochemistry",
        "microbiology",
        "immunology",
        "pathology",
        "radiology",
        "other",
      ],
      required: true,
    },

    testCodes: [String], // Array of test codes included in this report

    // Template and Layout
    template: ReportTemplateSchema,

    // Results and Findings
    results: [ResultItemSchema],

    // Clinical Information
    clinicalHistory: { type: String },
    clinicalFindings: { type: String },
    impression: { type: String },
    recommendations: { type: String },
    additionalComments: { type: String },

    // Status and Workflow
    status: {
      type: String,
      enum: [
        "draft",
        "in_review",
        "pending_approval",
        "approved",
        "delivered",
        "amended",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    priority: {
      type: String,
      enum: ["routine", "urgent", "stat"],
      default: "routine",
    },

    // Approval Workflow
    approvals: [ApprovalSchema],

    finalApproval: {
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      approvedAt: { type: Date },
      signature: {
        digital: { type: String },
        certificate: { type: String },
        timestamp: { type: Date },
      },
    },

    // Quality Control
    qualityControls: [QualityControlSchema],

    // Timing Information
    reportedAt: { type: Date },
    deliveredAt: { type: Date },
    printedAt: { type: Date },

    // Doctor and Referral Information
    referringDoctor: {
      name: { type: String },
      contact: { type: String },
      hospital: { type: String },
      specialization: { type: String },
    },

    consultingPathologist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Report Generation
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // File Management
    files: [
      {
        type: {
          type: String,
          enum: ["pdf", "image", "document", "other"],
          required: true,
        },
        filename: { type: String, required: true },
        url: { type: String, required: true },
        size: { type: Number },
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],

    pdfUrl: { type: String },
    pdfGeneratedAt: { type: Date },

    // Amendment and Version Control
    version: { type: Number, default: 1 },
    isAmended: { type: Boolean, default: false },
    amendmentReason: { type: String },
    amendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amendedAt: { type: Date },
    originalReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },

    // Delivery Information
    deliveryMethod: {
      type: String,
      enum: ["email", "sms", "portal", "print", "courier"],
      default: "email",
    },

    deliveryStatus: {
      type: String,
      enum: ["pending", "sent", "delivered", "failed"],
      default: "pending",
    },

    deliveryDetails: {
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      trackingNumber: { type: String },
    },

    // Security and Access
    accessLog: [
      {
        accessedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        accessedAt: { type: Date, default: Date.now },
        action: {
          type: String,
          enum: ["view", "download", "print", "share", "edit"],
        },
        ipAddress: { type: String },
        userAgent: { type: String },
      },
    ],

    isConfidential: { type: Boolean, default: false },
    accessRestrictions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        permission: {
          type: String,
          enum: ["view", "download", "print", "share"],
        },
      },
    ],

    // Flags and Metadata
    isCritical: { type: Boolean, default: false },
    isUrgent: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lockedAt: { type: Date },

    // Integration and External Systems
    externalReportId: { type: String },
    integrationData: {
      lis: {
        // Laboratory Information System
        id: { type: String },
        status: { type: String },
        lastSync: { type: Date },
      },
      his: {
        // Hospital Information System
        id: { type: String },
        status: { type: String },
        lastSync: { type: Date },
      },
    },

    // Analytics and Metrics
    metrics: {
      turnaroundTime: { type: Number }, // in hours
      reviewTime: { type: Number }, // in hours
      approvalTime: { type: Number }, // in hours
      deliveryTime: { type: Number }, // in hours
      viewCount: { type: Number, default: 0 },
      downloadCount: { type: Number, default: 0 },
      printCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
ReportSchema.index({ labId: 1, status: 1 });
ReportSchema.index({ labId: 1, createdAt: -1 });
ReportSchema.index({ patientId: 1, createdAt: -1 });
ReportSchema.index({ sampleId: 1 });
ReportSchema.index({ reportNumber: 1 }, { unique: true });
ReportSchema.index({ reportId: 1 }, { unique: true });
ReportSchema.index({ testCategory: 1, status: 1 });

// Pre-save middleware to generate report ID and number
ReportSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      // Generate unique report ID
      if (!this.reportId) {
        const lab = await mongoose.model("Lab").findById(this.labId);
        if (!lab) {
          throw new Error("Lab not found");
        }

        const labCode = lab.name.substring(0, 3).toUpperCase();
        const today = new Date();
        const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
        const count = await mongoose.model("Report").countDocuments({
          labId: this.labId,
          createdAt: {
            $gte: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate()
            ),
            $lt: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + 1
            ),
          },
        });

        this.reportId = `RPT${labCode}${dateStr}${String(count + 1).padStart(
          4,
          "0"
        )}`;
      }

      // Generate report number if not provided
      if (!this.reportNumber) {
        this.reportNumber = `${this.reportId}-${crypto
          .randomBytes(2)
          .toString("hex")
          .toUpperCase()}`;
      }

      // Set initial metrics
      if (!this.metrics) {
        this.metrics = {
          viewCount: 0,
          downloadCount: 0,
          printCount: 0,
        };
      }
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Methods
ReportSchema.methods.updateStatus = function (
  newStatus,
  updatedBy,
  comments = ""
) {
  const previousStatus = this.status;
  this.status = newStatus;

  // Update timing based on status
  const now = new Date();
  switch (newStatus) {
    case "approved":
      this.reportedAt = now;
      break;
    case "delivered":
      this.deliveredAt = now;
      break;
  }

  // Log the access
  this.accessLog.push({
    accessedBy: updatedBy,
    action: "edit",
    accessedAt: now,
  });

  return this.save();
};

ReportSchema.methods.addApproval = function (
  approvedBy,
  level,
  signature = null,
  comments = ""
) {
  this.approvals.push({
    approvedBy,
    level,
    signature,
    comments,
  });

  // Check if this is the final approval (pathologist or consultant)
  if (["pathologist", "consultant"].includes(level)) {
    this.finalApproval = {
      approvedBy,
      approvedAt: new Date(),
      signature,
    };
    this.status = "approved";
    this.reportedAt = new Date();
  }

  return this.save();
};

ReportSchema.methods.amendReport = function (
  amendedBy,
  reason,
  newResults = null
) {
  this.isAmended = true;
  this.amendmentReason = reason;
  this.amendedBy = amendedBy;
  this.amendedAt = new Date();
  this.version += 1;

  if (newResults) {
    this.results = newResults;
  }

  // Reset approval status for amended reports
  this.status = "pending_approval";
  this.approvals = [];
  this.finalApproval = {};

  return this.save();
};

ReportSchema.methods.logAccess = function (
  userId,
  action,
  ipAddress = "",
  userAgent = ""
) {
  this.accessLog.push({
    accessedBy: userId,
    action,
    ipAddress,
    userAgent,
  });

  // Update metrics
  switch (action) {
    case "view":
      this.metrics.viewCount += 1;
      break;
    case "download":
      this.metrics.downloadCount += 1;
      break;
    case "print":
      this.metrics.printCount += 1;
      break;
  }

  return this.save();
};

ReportSchema.methods.calculateTurnaroundTime = function () {
  if (this.createdAt && this.reportedAt) {
    const turnaroundHours = Math.round(
      (this.reportedAt - this.createdAt) / (1000 * 60 * 60)
    );
    this.metrics.turnaroundTime = turnaroundHours;
    return turnaroundHours;
  }
  return null;
};

ReportSchema.methods.isOverdue = function () {
  if (
    !this.createdAt ||
    ["approved", "delivered", "cancelled"].includes(this.status)
  ) {
    return false;
  }

  const hoursElapsed = (new Date() - this.createdAt) / (1000 * 60 * 60);
  const maxHours =
    this.priority === "stat" ? 2 : this.priority === "urgent" ? 6 : 24;

  return hoursElapsed > maxHours;
};

ReportSchema.methods.canAccess = function (userId, action = "view") {
  // Check if user has specific access restrictions
  const restriction = this.accessRestrictions.find(
    (r) => r.userId.toString() === userId.toString()
  );
  if (restriction) {
    return (
      restriction.permission === action ||
      (action === "view" &&
        ["download", "print", "share"].includes(restriction.permission))
    );
  }

  // Default access based on confidentiality
  return !this.isConfidential;
};

export default mongoose.model("Report", ReportSchema);
