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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServices = exports.regenerateLastMessage = exports.sendMessage = exports.processChatMessage = exports.deleteAllChats = exports.deleteChat = exports.updateChatTitle = exports.getChatById = exports.getUserChats = exports.createChat = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const chat_model_1 = require("./chat.model");
const vedicKnowledge_service_1 = require("../vedicKnowledge/vedicKnowledge.service");
//Create a new chat
const createChat = (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = new chat_model_1.AIChat({
        userId: new mongoose_1.Types.ObjectId(userId),
        title: data.title || "New Chat",
        messages: [],
    });
    yield chat.save();
    // If there's an initial message, process it
    if (data.initialMessage) {
        const response = yield (0, exports.processChatMessage)(chat._id.toString(), userId, data.initialMessage);
        return response.chat;
    }
    return chat;
});
exports.createChat = createChat;
//Get all chats for a user
const getUserChats = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = 1, limit = 20, search = "", category = "", sortBy = "newest" } = query;
    const result = yield chat_model_1.AIChat.getUserChats(userId, {
        page,
        limit,
        search,
        category,
        sortBy,
    });
    return result;
});
exports.getUserChats = getUserChats;
//Get a single chat by ID
const getChatById = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findOne({
        _id: new mongoose_1.Types.ObjectId(chatId),
        userId: new mongoose_1.Types.ObjectId(userId),
        isActive: true,
    });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    return chat;
});
exports.getChatById = getChatById;
//Update chat title
const updateChatTitle = (chatId, userId, title) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(chatId), userId: new mongoose_1.Types.ObjectId(userId) }, { title }, { new: true });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    return chat;
});
exports.updateChatTitle = updateChatTitle;
//Delete a chat (soft delete)
const deleteChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(chatId), userId: new mongoose_1.Types.ObjectId(userId) }, { isActive: false });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
});
exports.deleteChat = deleteChat;
//Delete all chats for a user
const deleteAllChats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_model_1.AIChat.updateMany({ userId: new mongoose_1.Types.ObjectId(userId) }, { isActive: false });
    return result.modifiedCount || 0;
});
exports.deleteAllChats = deleteAllChats;
//Process a chat message with RAG
const processChatMessage = (chatId, userId, userMessage) => __awaiter(void 0, void 0, void 0, function* () {
    // Get or create chat
    const chat = yield chat_model_1.AIChat.findOne({
        _id: new mongoose_1.Types.ObjectId(chatId),
        userId: new mongoose_1.Types.ObjectId(userId),
        isActive: true,
    });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    // Add user message
    chat.messages.push({
        role: "user",
        content: userMessage,
        timestamp: new Date(),
    });
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    yield chat.save();
    // Process with RAG
    const ragResponse = yield vedicKnowledge_service_1.VedicKnowledgeServices.answerQuestion({
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
    yield chat.save();
    // Auto-update title if it's the first message
    if (chat.messages.length === 2 && chat.title === "New Chat") {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        chat.title = title;
        yield chat.save();
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
});
exports.processChatMessage = processChatMessage;
//Send a new message in a chat
const sendMessage = (chatId, userId, userMessage, options) => __awaiter(void 0, void 0, void 0, function* () {
    if (!userMessage || userMessage.trim().length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Message cannot be empty");
    }
    const chat = yield chat_model_1.AIChat.findOne({
        _id: new mongoose_1.Types.ObjectId(chatId),
        userId: new mongoose_1.Types.ObjectId(userId),
        isActive: true,
    });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    // Add user message
    chat.messages.push({
        role: "user",
        content: userMessage.trim(),
        timestamp: new Date(),
        metadata: {
            language: (options === null || options === void 0 ? void 0 : options.language) || "en",
        },
    });
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    yield chat.save();
    // Process with RAG
    const ragResponse = yield vedicKnowledge_service_1.VedicKnowledgeServices.answerQuestion({
        question: userMessage.trim(),
        language: (options === null || options === void 0 ? void 0 : options.language) || "en",
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
        role: "assistant",
        content: ragResponse.answer,
        sources: ragResponse.sources,
        timestamp: new Date(),
        metadata: {
            processingTime: ragResponse.processingTime,
            confidence: ragResponse.confidence,
            language: (options === null || options === void 0 ? void 0 : options.language) || "en",
        },
    };
    chat.messages.push(assistantMessage);
    chat.totalMessages = chat.messages.length;
    chat.lastMessageAt = new Date();
    yield chat.save();
    // Auto-update title if it's the first user message
    if (chat.messages.filter((m) => m.role === "user").length === 1 && chat.title === "New Chat") {
        const title = userMessage.slice(0, 50) + (userMessage.length > 50 ? "..." : "");
        chat.title = title;
        yield chat.save();
    }
    const chatIdValue = chat._id.toString();
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
});
exports.sendMessage = sendMessage;
//Regenerate the last assistant message
const regenerateLastMessage = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chat = yield chat_model_1.AIChat.findOne({
        _id: new mongoose_1.Types.ObjectId(chatId),
        userId: new mongoose_1.Types.ObjectId(userId),
        isActive: true,
    });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    // Find the last user message
    const lastUserMessageIndex = chat.messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserMessageIndex === -1) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "No user message to regenerate");
    }
    const lastUserMessage = chat.messages[lastUserMessageIndex];
    // Remove the last assistant message (if any)
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage.role === "assistant") {
        chat.messages.pop();
    }
    // Save the chat without the assistant message
    yield chat.save();
    // Regenerate response
    const result = yield (0, exports.sendMessage)(chatId, userId, lastUserMessage.content, {
        language: ((_a = lastUserMessage.metadata) === null || _a === void 0 ? void 0 : _a.language) || "en",
    });
    return result;
});
exports.regenerateLastMessage = regenerateLastMessage;
exports.ChatServices = {
    createChat: exports.createChat,
    getUserChats: exports.getUserChats,
    getChatById: exports.getChatById,
    updateChatTitle: exports.updateChatTitle,
    deleteChat: exports.deleteChat,
    deleteAllChats: exports.deleteAllChats,
    sendMessage: exports.sendMessage,
    regenerateLastMessage: exports.regenerateLastMessage,
    processChatMessage: exports.processChatMessage,
};
