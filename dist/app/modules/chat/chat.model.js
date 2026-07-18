"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ChatSchema = new mongoose_1.Schema({
    participants: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "User",
        required: true,
        index: true,
    },
    lastMessage: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Message",
    },
    lastMessageAt: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });
// Ensure unique participants combination
ChatSchema.index({ participants: 1 });
const Chat = (0, mongoose_1.model)("Chat", ChatSchema);
exports.default = Chat;
