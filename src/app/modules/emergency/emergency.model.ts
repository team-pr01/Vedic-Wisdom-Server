import { Schema, model } from "mongoose";
import { TEmergency } from "./emergency.interface";

const EmergencySchema = new Schema<TEmergency>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "forwarded", "resolved"],
      default: "pending",
    },
    resolvedAt  : {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Emergency = model<TEmergency>("Emergency", EmergencySchema);

export default Emergency;