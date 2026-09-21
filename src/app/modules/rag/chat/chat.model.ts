/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, Types, model } from "mongoose";
import { IChat, IChatMessage, IChatSource } from "./chat.interface";


const ChatSourceSchema = new Schema<IChatSource>(
  {
    fileType: { type: String },
    displayName: { type: String },
    pages: { type: String },
    location: { type: String },
    chapter: { type: String },
    subChapter: { type: String },
    section: { type: String },
  },
  { _id: false }
);


const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isSourceVerified: {
      type: Boolean,
      default: false,
    },
     sources: { type: [ChatSourceSchema], default: [] },
  },
  { _id: true }
);

const ChatSchema = new Schema<IChat>(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    messages: {
      type: [ChatMessageSchema],
      default: [],
    },
    
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ title: "text" });

const AIChat = model<IChat>("AIChat", ChatSchema);

export { AIChat };