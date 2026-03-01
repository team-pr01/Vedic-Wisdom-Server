import { Schema, model } from "mongoose";
import { TVastu } from "./vastu.interface";

const VastuSchema = new Schema<TVastu>(
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
      index: true
    },

    videoSource: {
      type: String,
      required: true,
    },

    videoUrl: {
      type: String,
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    viewsCount: {
      type: Number,
      default: 0,
      index: true,
    },

    viewedBy: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

VastuSchema.index({ createdAt: -1 });
VastuSchema.index({ category: 1, createdAt: -1 });

const Vastu = model<TVastu>("Vastu", VastuSchema);

export default Vastu;