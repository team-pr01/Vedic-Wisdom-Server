import { Schema, model } from "mongoose";
import { TApplication } from "./application.interface";

/* ---------------- SCHEMA ---------------- */
const applicationSchema = new Schema<TApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["applied", "withdrawn", "shortlisted", "hired", "rejected"],
      default: "applied",
      index: true,
    },

    selectedCandidate: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    resume: {
      type: String,
      required: true,
      trim: true,
    },
    noteFromApplicant: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- INDEXES ---------------- */
applicationSchema.index({ jobId: 1, userId: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });


const Application = model<TApplication>("Application", applicationSchema);

export default Application;