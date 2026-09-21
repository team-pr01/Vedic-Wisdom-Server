"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiver: {
        type: mongoose_1.Types.ObjectId,
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
}, { timestamps: true });
const Message = (0, mongoose_1.model)("Message", MessageSchema);
exports.default = Message;
