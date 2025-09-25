import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  street: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String },
  country: { type: String, default: "India" },
});

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: [true, "Gender is required"],
    },
    dateOfBirth: {
      type: Date,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", ""],
    },
    address: {
      type: addressSchema,
      required: true,
    },
    // Medical Information
    allergies: {
      type: String,
      trim: true,
    },
    medicalHistory: {
      type: String,
      trim: true,
    },
    referringDoctor: {
      type: String,
      trim: true,
    },
    patientCategory: {
      type: String,
      enum: ["OPD", "Inpatient", "Home Collection", "Emergency"],
      default: "OPD",
    },
    // Payment Information
    totalAmount: {
      type: Number,
      default: 0,
      min: [0, "Total amount cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    paymentType: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Insurance", "Pending"],
      default: "Cash",
    },
    finalAmount: {
      type: Number,
      default: 0,
      min: [0, "Final amount cannot be negative"],
    },
    // Collection Information
    collectionType: {
      type: String,
      enum: ["In-lab", "Home Collection"],
      default: "In-lab",
    },
    assignedTechnician: {
      type: String,
      trim: true,
    },
    collectionDate: {
      type: Date,
    },
    // Notification Preferences
    smsNotification: {
      type: Boolean,
      default: true,
    },
    emailNotification: {
      type: Boolean,
      default: true,
    },
    whatsappNotification: {
      type: Boolean,
      default: false,
    },
    // Admin Fields
    vipStatus: {
      type: Boolean,
      default: false,
    },
    urgentReport: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
    reportDeliveryDate: {
      type: Date,
    },
    sampleBarcode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    // Selected Tests
    selectedTests: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    // Status
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Patient", patientSchema);
