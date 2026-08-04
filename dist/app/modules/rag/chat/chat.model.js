"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChat = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
const mongoose_1 = require("mongoose");
const ChatMessageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ["user", "assistant", "system"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sources: [
        {
            documentId: { type: String },
            title: { type: String },
            category: { type: String },
            content: { type: String },
            relevanceScore: { type: Number },
            url: { type: String },
        },
    ],
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        processingTime: { type: Number },
        confidence: { type: Number },
        language: { type: String },
        category: { type: String },
    },
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
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    totalMessages: {
        type: Number,
        default: 0,
    },
    lastMessageAt: {
        type: Date,
        default: Date.now,
        index: true,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
// ==================== INDEXES ====================
// For fetching user chats
ChatSchema.index({ userId: 1, lastMessageAt: -1 });
ChatSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
// For search
ChatSchema.index({ title: "text", "messages.content": "text" });
// For analytics
ChatSchema.index({ userId: 1, totalMessages: -1 });
// ==================== VIRTUAL PROPERTIES ====================
ChatSchema.virtual("lastMessage").get(function () {
    if (this.messages.length === 0)
        return null;
    return this.messages[this.messages.length - 1];
});
ChatSchema.virtual("messageCount").get(function () {
    return this.messages.length;
});
ChatSchema.virtual("userMessages").get(function () {
    return this.messages.filter((m) => m.role === "user");
});
ChatSchema.virtual("assistantMessages").get(function () {
    return this.messages.filter((m) => m.role === "assistant");
});
// ==================== PRE-SAVE HOOK ====================
ChatSchema.pre("save", function (next) {
    // Update total messages count
    this.totalMessages = this.messages.length;
    // Update last message timestamp
    if (this.messages.length > 0) {
        this.lastMessageAt = this.messages[this.messages.length - 1].timestamp || new Date();
    }
    // Auto-generate title if not provided
    if (!this.title || this.title === "New Chat") {
        const firstUserMessage = this.messages.find((m) => m.role === "user");
        if (firstUserMessage) {
            this.title = firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? "..." : "");
        }
    }
    next();
});
// ==================== STATIC METHODS ====================
ChatSchema.statics.getUserChats = function (userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, options = {}) {
        const { page = 1, limit = 20, search = "", category = "", sortBy = "newest" } = options;
        const query = { userId: new mongoose_1.Types.ObjectId(userId), isActive: true };
        if (search) {
            query.$text = { $search: search };
        }
        if (category) {
            query.category = category;
        }
        let sort = { lastMessageAt: -1 };
        if (sortBy === "oldest")
            sort = { createdAt: 1 };
        if (sortBy === "most_messages")
            sort = { totalMessages: -1 };
        const skip = (page - 1) * limit;
        const [chats, total] = yield Promise.all([
            this.find(query)
                .select("title messages lastMessageAt totalMessages createdAt category")
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean(),
            this.countDocuments(query),
        ]);
        return {
            chats,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + limit < total,
            },
        };
    });
};
ChatSchema.statics.addMessage = function (chatId, role, content, metadata) {
    return __awaiter(this, void 0, void 0, function* () {
        const chat = yield this.findById(chatId);
        if (!chat) {
            throw new Error("Chat not found");
        }
        const message = {
            role,
            content,
            timestamp: new Date(),
        };
        if (metadata) {
            message.sources = metadata.sources;
            message.metadata = metadata.metadata;
        }
        chat.messages.push(message);
        chat.totalMessages = chat.messages.length;
        chat.lastMessageAt = new Date();
        yield chat.save();
        return chat;
    });
};
// ==================== MODEL ====================
const AIChat = (0, mongoose_1.model)("AIChat", ChatSchema);
exports.AIChat = AIChat;
