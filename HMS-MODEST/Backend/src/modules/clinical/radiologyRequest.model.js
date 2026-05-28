import mongoose from "mongoose";

const radiologyFindingsSchema = new mongoose.Schema({
  finding: { type: String, required: true },
  severity: { type: String, enum: ["normal", "mild", "moderate", "severe"], default: "normal" },
  location: { type: String, default: null },
  notes: { type: String, default: null },
});

const radiologyRequestSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      set: v => v === "" ? null : v,
      required: [true, "Patient is required"],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      set: v => v === "" ? null : v,
      required: [true, "Doctor is required"],
    },
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      set: v => v === "" ? null : v,
      default: null,
    },
    scanType: {
      type: String,
      enum: [
        "X-Ray",
        "Ultrasound",
        "CT Scan",
        "MRI",
        "Mammogram",
        "Fluoroscopy",
        "PET Scan",
        "DEXA Scan",
        "Other",
      ],
      required: [true, "Scan type is required"],
    },
    bodyPart: {
      type: String,
      required: [true, "Body part is required"],
    },
    urgency: {
      type: String,
      enum: ["routine", "urgent", "emergency"],
      default: "routine",
    },
    clinicalNotes: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "cancelled"],
      default: "pending",
    },
    findings: [radiologyFindingsSchema],
    impression: {
      type: String,
      default: null,
    },
    recommendation: {
      type: String,
      default: null,
    },
    radiologistNotes: {
      type: String,
      default: null,
    },
    imageCount: {
      type: Number,
      default: 0,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    resultUploadedAt: {
      type: Date,
      default: null,
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },
  },
  { timestamps: true }
);

const RadiologyRequest = mongoose.model("RadiologyRequest", radiologyRequestSchema);

export default RadiologyRequest;