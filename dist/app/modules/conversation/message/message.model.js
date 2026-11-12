"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    conversationId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    readBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }], // Who has seen it
    deleteAt: { type: Date, default: null }, // When to auto-delete
    isSystemMessage: { type: Boolean, default: false },
    reactions: [
        {
            emoji: { type: String, required: true },
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
            userName: { type: String, required: true },
        }
    ],
    mentions: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }],
    deletedFor: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "User" }], // Track who deleted it
    isDeletedForEveryone: { type: Boolean, default: false },
}, { timestamps: true });
// TTL Index: MongoDB will automatically delete the document when the current time reaches 'deleteAt' [citation:15][citation:21]
messageSchema.index({ deleteAt: 1 }, { expireAfterSeconds: 0 });
exports.Message = (0, mongoose_1.model)("Message", messageSchema);
