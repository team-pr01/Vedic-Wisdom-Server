import { Schema, model } from "mongoose";
import { TReport } from "./report.interface";

const reportSchema = new Schema<TReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reportType: {
      type: String,
      enum: ["user", "group"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export const Report = model<TReport>("Report", reportSchema);