import { Schema, model } from "mongoose";
import { TConversation } from "./conversation.interface";

const conversationSchema = new Schema<TConversation>({
  isGroup: { type: Boolean, default: false },
  groupName: { type: String }, // Only for groups
  groupAvatar: { type: String }, // Only for groups
  members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
  admins: [{ type: Schema.Types.ObjectId, ref: "User" }], // For group admins
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" }, // For chat list preview
  blockedBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // For 1-on-1 blocking
  messageRequestStatus: { 
    type: String, 
    enum: ["pending", "accepted", "rejected", "none"], 
    default: "none" 
  },
  requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export const Conversation = model("Conversation", conversationSchema);