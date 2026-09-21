import { Schema, Types, model } from "mongoose";
import { TReels } from "./reels.interface";

const ReelsSchema = new Schema<TReels>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoSource: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    likes: { type: Number, default: 0, required: false },
    likedBy: [{ type: Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const Reels = model<TReels>("Reels", ReelsSchema);

export default Reels;
