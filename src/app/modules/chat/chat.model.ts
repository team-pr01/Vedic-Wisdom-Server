import { Schema, model } from "mongoose";
import { TChat } from "./chat.interface";

const ChatSchema = new Schema<TChat>(
    {
        participants: {
            type: [Schema.Types.ObjectId],
            ref: "User",
            required: true,
            index: true,
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: "Message",
        },
        lastMessageAt: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Ensure unique participants combination
ChatSchema.index({ participants: 1 });

const Chat = model<TChat>("Chat", ChatSchema);

export default Chat;