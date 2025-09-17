import mongoose from "mongoose";

const LogSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entity: { type: String },
    entityId: { type: String },
    metadata: {},
  },
  { timestamps: true }
);

export default mongoose.model("Log", LogSchema);
