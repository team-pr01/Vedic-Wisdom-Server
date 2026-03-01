import { Schema, model } from "mongoose";
import { TVastuTips } from "./vastuTips.interface";

const VastuTipsSchema = new Schema<TVastuTips>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: "text", // for search
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true, // for filtering
    },

    tips: {
      type: [String],
      required: true,
      validate: [
        (arr: string[]) => arr.length > 0,
        "At least one tip is required",
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Sorting optimization
VastuTipsSchema.index({ createdAt: -1 });
VastuTipsSchema.index({ category: 1, createdAt: -1 });

export const VastuTips = model<TVastuTips>(
  "VastuTips",
  VastuTipsSchema
);