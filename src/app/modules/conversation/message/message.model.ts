import { Schema, model } from "mongoose";
import { TMessage } from "./message.interface";

const messageSchema = new Schema<TMessage>({
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }], // Who has seen it
    deleteAt: { type: Date, default: null }, // When to auto-delete
    isSystemMessage: { type: Boolean, default: false }
}, { timestamps: true });

// TTL Index: MongoDB will automatically delete the document when the current time reaches 'deleteAt' [citation:15][citation:21]
messageSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });

export const Message = model("Message", messageSchema);