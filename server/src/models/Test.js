import mongoose from "mongoose";

// Sub-schemas for embedding
const specimenSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "blood",
      "urine",
      "stool",
      "sputum",
      "swab",
      "tissue",
      "whole blood",
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
    ],
    required: true,
  },
  collectionInstructions: {
    type: String,
  },
});

const pricingSchema = new mongoose.Schema({
  basePrice: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "INR",
  },
});

const turnaroundTimeSchema = new mongoose.Schema({
  routine: {
    duration: { type: Number, required: true },
    unit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      default: "hours",
    },
  },
});

// Main Test Schema
const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      // Corrected to lowercase to match Report schema
      enum: [
        "biochemistry",
        "microbiology",
        "serology",
        "histopathology",
        "hematology",
        "immunology",
        "pathology",
        "radiology",
        "other",
      ],
      required: true,
    },
    department: {
      type: String,
      // Corrected to lowercase
      enum: ["pathology", "microbiology", "biochemistry", "clinical pathology"],
      required: true,
    },
    specimen: specimenSchema,
    pricing: pricingSchema,
    turnaroundTime: turnaroundTimeSchema,
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Test", testSchema);
