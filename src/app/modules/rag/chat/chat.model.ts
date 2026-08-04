/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, Types, model } from "mongoose";
import { IChat, IChatMessage } from "./chat.interface";

const ChatMessageSchema = new Schema<IChatMessage>(
  {
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

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
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

ChatSchema.virtual("messageCount").get(function () {
  return this.messages.length;
});

ChatSchema.virtual("userMessages").get(function () {
  return this.messages.filter((m: any) => m.role === "user");
});

ChatSchema.virtual("assistantMessages").get(function () {
  return this.messages.filter((m: any) => m.role === "assistant");
});

// ==================== PRE-SAVE HOOK ====================

ChatSchema.pre<IChat>("save", function (next) {
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

ChatSchema.statics.getUserChats = async function (userId: string, options: any = {}) {
  const { page = 1, limit = 20, search = "", category = "", sortBy = "newest" } = options;

  const query: any = { userId: new Types.ObjectId(userId), isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  let sort: Record<string, 1 | -1> = { lastMessageAt: -1 };
  if (sortBy === "oldest") sort = { createdAt: 1 };
  if (sortBy === "most_messages") sort = { totalMessages: -1 };

  const skip = (page - 1) * limit;

  const [chats, total] = await Promise.all([
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
};

ChatSchema.statics.addMessage = async function (
  chatId: string,
  role: "user" | "assistant" | "system",
  content: string,
  metadata?: any
) {
  const chat = await this.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }

  const message: any = {
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

  await chat.save();
  return chat;
};

// ==================== MODEL ====================

const AIChat = model<IChat>("AIChat", ChatSchema);

export type ChatModel = typeof AIChat;
export { AIChat };