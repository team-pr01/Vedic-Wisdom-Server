import { Schema, model, Types } from "mongoose";
import { TReportMantra } from "./reportMantra.interface";

const ReportMantraSchema = new Schema<TReportMantra>(
  {
    bookId: { type: Types.ObjectId, ref: "Books", required: true },
    textId: { type: Types.ObjectId, ref: "BookText", required: true },
    originalText: { type: String, required: true },
    languageCode: { type: String, required: true },
    translation: { type: String, required: true },
    reason: { type: String, required: true },
    feedback: { type: String, required: true },
    status : { type: String, enum: ["pending", "resolved", "dismissed"], default: "pending" },
    isHumanVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ReportMantra = model<TReportMantra>("ReportMantra", ReportMantraSchema);
export default ReportMantra;