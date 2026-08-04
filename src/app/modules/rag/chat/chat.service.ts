/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../../errors/AppError";
import { AIChat } from "./chat.model";
import { IChat, ICreateChat, IChatResponse, IGetChatsQuery } from "./chat.interface";
import { VedicKnowledgeServices } from "../vedicKnowledge/vedicKnowledge.service";

//Create a new chat
export const createChat = async (userId: string, data: ICreateChat): Promise<IChat> => {
    const chat = new AIChat({
        userId: new Types.ObjectId(userId),
        title: data.title || "New Chat",
        messages: [],
    }) as IChat & { _id: Types.ObjectId };

    await chat.save();

    // If there's an initial message, process it
    if (data.initialMessage) {
        const response = await processChatMessage(chat._id.toString(), userId, data.initialMessage);
        return response.chat;
    }

    return chat;
};

//Get all chats for a user
export const getUserChats = async (userId: string, query: IGetChatsQuery) => {
    const { page = 1, limit = 20, search = "", category = "", sortBy = "newest" } = query;

    const result = await (AIChat as any).getUserChats(userId, {
        page,
        limit,
        search,
        category,
        sortBy,
    });

    return result;
};

//Get a single chat by ID
export const getChatById = async (chatId: string, userId: string): Promise<IChat> => {
    const chat = await AIChat.findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        isActive: true,
    });

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    return chat;
};

//Update chat title
export const updateChatTitle = async (chatId: string, userId: string, title: string): Promise<IChat> => {
    const chat = await AIChat.findOneAndUpdate(
        { _id: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) },
        { title },
        { new: true }
    );

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    return chat;
};

//Delete a chat (soft delete)
export const deleteChat = async (chatId: string, userId: string): Promise<void> => {
    const chat = await AIChat.findOneAndUpdate(
        { _id: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) },
        { isActive: false }
    );

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }
};

//Delete all chats for a user
export const deleteAllChats = async (userId: string): Promise<number> => {
    const result = await AIChat.updateMany(
        { userId: new Types.ObjectId(userId) },
        { isActive: false }
    );

    return result.modifiedCount || 0;
};

//Process a chat message with RAG
export const processChatMessage = async (
    chatId: string,
    userId: string,
    userMessage: string
): Promise<{ chat: IChat; message: IChatResponse["message"] }> => {
    // Get or create chat
    const chat = await AIChat.findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        isActive: true,
    });

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    // Add user message
    chat.messages.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
    });
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Process with RAG
    const ragResponse = await VedicKnowledgeServices.answerQuestion({
        question: userMessage,
        language: "en",
        history: chat.messages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.content,
        })),
    });

    // Add assistant message
    chat.messages.push({
        role: "assistant",
        content: ragResponse.answer,
        sources: ragResponse.sources,
        timestamp: new Date(),
        metadata: {
            processingTime: ragResponse.processingTime,
            confidence: ragResponse.confidence,
        },
    });
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Auto-update title if it's the first message
    if (chat.messages.length === 2 && chat.title === "New Chat") {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        chat.title = title;
        await chat.save();
    }

    return {
        chat,
        message: {
            role: "assistant",
            content: ragResponse.answer,
            sources: ragResponse.sources,
            metadata: {
                processingTime: ragResponse.processingTime,
                confidence: ragResponse.confidence,
            },
        },
    };
};

//Send a new message in a chat
export const sendMessage = async (
    chatId: string,
    userId: string,
    userMessage: string,
    options?: { language?: string; category?: string }
): Promise<IChatResponse> => {
    if (!userMessage || userMessage.trim().length === 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Message cannot be empty");
    }

    const chat = await AIChat.findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        isActive: true,
    });

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    // Add user message
    chat.messages.push({
        role: "user",
        content: userMessage.trim(),
        timestamp: new Date(),
        metadata: {
            language: options?.language || "en",
        },
    });
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Process with RAG
    const ragResponse = await VedicKnowledgeServices.answerQuestion({
        question: userMessage.trim(),
        language: options?.language || "en",
        history: chat.messages
            .filter((m) => m.role === "user" || m.role === "assistant")
            .slice(-10)
            .map((m) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
            })),
    });

    // Add assistant message
    const assistantMessage = {
        role: "assistant" as const,
        content: ragResponse.answer,
        sources: ragResponse.sources,
        timestamp: new Date(),
        metadata: {
            processingTime: ragResponse.processingTime,
            confidence: ragResponse.confidence,
            language: options?.language || "en",
        },
    };

    chat.messages.push(assistantMessage);
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Auto-update title if it's the first user message
    if (chat.messages.filter((m) => m.role === "user").length === 1 && chat.title === "New Chat") {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        chat.title = title;
        await chat.save();
    }

    const chatIdValue = (chat as { _id: Types.ObjectId | { toString(): string } })._id.toString();

    return {
        chatId: chatIdValue,
        chatTitle: chat.title,
        message: {
            role: "assistant",
            content: ragResponse.answer,
            sources: ragResponse.sources,
            metadata: {
                processingTime: ragResponse.processingTime,
                confidence: ragResponse.confidence,
            },
        },
    };
};

//Regenerate the last assistant message
export const regenerateLastMessage = async (
    chatId: string,
    userId: string
): Promise<IChatResponse> => {
    const chat = await AIChat.findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId),
        isActive: true,
    });

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    // Find the last user message
    const lastUserMessageIndex = chat.messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserMessageIndex === -1) {
        throw new AppError(httpStatus.BAD_REQUEST, "No user message to regenerate");
    }

    const lastUserMessage = chat.messages[lastUserMessageIndex];

    // Remove the last assistant message (if any)
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.role === "assistant") {
        chat.messages.pop();
    }

    // Save the chat without the assistant message
    await chat.save();

    // Regenerate response
    const result = await sendMessage(
        chatId,
        userId,
        lastUserMessage.content,
        {
            language: lastUserMessage.metadata?.language || "en",
        }
    );

    return result;
};

export const ChatServices = {
    createChat,
    getUserChats,
    getChatById,
    updateChatTitle,
    deleteChat,
    deleteAllChats,
    sendMessage,
    regenerateLastMessage,
    processChatMessage,
};