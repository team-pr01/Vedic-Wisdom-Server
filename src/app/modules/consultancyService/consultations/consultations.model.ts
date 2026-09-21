import { Schema, model } from "mongoose";
import { TConsultation } from "./consultations.interface";

const ConsultationSchema = new Schema<TConsultation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    consultationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    consultantId: {
      type: Schema.Types.ObjectId,
      ref: "ConsultancyService",
      required: true,
      index: true,
    },

    concern: {
      type: String,
      required: false,
      trim: true,
    },

    scheduledAt: {
      type: Date,
      required: false,
    },

    meetingLink: {
      type: String,
      required: false,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "scheduled", "closed", "cancelled"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
ConsultationSchema.index({ userId: 1, status: 1 });
ConsultationSchema.index({ consultationId: 1, status: 1 });
ConsultationSchema.index({ consultantId: 1, status: 1 });
ConsultationSchema.index({ createdAt: -1 });

// Text search index
ConsultationSchema.index({
  consultationId: "text",
  concern: "text",
});

const Consultation = model<TConsultation>("Consultation", ConsultationSchema);
export default Consultation;