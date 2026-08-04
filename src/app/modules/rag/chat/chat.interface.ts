/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from "mongoose";
import { Document } from "mongoose";

export interface IChatMessage {
    role: "user" | "assistant" | "system";
    content: string;
    sources?: {
        documentId: string;
        title: string;
        category: string;
        content: string;
        relevanceScore: number;
        url?: string;
    }[];
    timestamp: Date;
    metadata?: {
        processingTime?: number;
        confidence?: number;
        language?: string;
        category?: string;
    };
}

export interface IChat extends Document {
    userId: ObjectId;
    title: string;
    messages: IChatMessage[];
    isActive: boolean;
    totalMessages: number;
    lastMessageAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface ICreateChat {
    _id?: string;
    title: string;
    initialMessage?: string;
}

export interface IAddMessage {
    chatId: string;
    userMessage: string;
    assistantMessage: string;
    sources?: IChatMessage["sources"];
    metadata?: IChatMessage["metadata"];
}

export interface IChatResponse {
    chatId: string;
    message: {
        role: "user" | "assistant";
        content: string;
        sources?: any[];
        metadata?: any;
    };
    chatTitle?: string;
}

export interface IGetChatsQuery {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sortBy?: "newest" | "oldest" | "most_messages";
}