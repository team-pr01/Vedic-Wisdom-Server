import { Schema, model } from "mongoose";
import { TAyurveda } from "./ayurveda.interface";

const ayurvedaSchema = new Schema<TAyurveda>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    videoSource: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text search
ayurvedaSchema.index({ title: "text", category: "text" });

const Ayurveda = model<TAyurveda>("Ayurveda", ayurvedaSchema);
export default Ayurveda;