import { Schema, Types, model } from "mongoose";
import { TMessage } from "./message.interface";

const MessageSchema = new Schema<TMessage>(
    {
        sender: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },
        receiver: {
            type: Types.ObjectId,
            ref: "User",
            required: false,
        },
        messageType: {
            type: String,
            enum: ["text", "image", "video", "file"],
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["sent", "delivered", "read"],
            default: "sent",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Message = model<TMessage>("Message", MessageSchema);
export default Message;
