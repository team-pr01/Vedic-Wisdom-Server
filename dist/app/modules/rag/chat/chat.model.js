"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChat = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const mongoose_1 = require("mongoose");
const ChatSourceSchema = new mongoose_1.Schema({
    fileType: { type: String },
    displayName: { type: String },
    pages: { type: String },
    location: { type: String },
    chapter: { type: String },
    subChapter: { type: String },
    section: { type: String },
}, { _id: false });
const ChatMessageSchema = new mongoose_1.Schema({
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
}, { _id: true });
const ChatSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
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
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
ChatSchema.index({ userId: 1, updatedAt: -1 });
ChatSchema.index({ title: "text" });
const AIChat = (0, mongoose_1.model)("AIChat", ChatSchema);
exports.AIChat = AIChat;
