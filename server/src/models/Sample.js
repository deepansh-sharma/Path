import mongoose from "mongoose";

const sampleSchema = new mongoose.Schema(
  {
    sampleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    barcode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lab",
      required: true,
    },
    sampleType: {
      type: String,
      // Added 'Blood' to the enum to fix the error
      enum: [
        "Blood",
        "Urine",
        "Stool",
        "Sputum",
        "Swab",
        "Tissue",
        "Whole Blood",
      ],
      required: true,
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["collected", "processing", "completed", "rejected"],
      default: "collected",
    },
    // This field seems more appropriate for an Invoice, but adding based on error
    totalAmount: {
      type: Number,
      required: true,
    },
    collectionDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sampleSchema.index({ barcode: 1 });
sampleSchema.index({ sampleId: 1 });

export default mongoose.model("Sample", sampleSchema);
