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
exports.ChatServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const chat_model_1 = require("./chat.model");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const config_1 = __importDefault(require("../../../config"));
const axios_1 = __importDefault(require("axios"));
const askQuestion = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const ragHost = config_1.default.rag_host;
    const ragApiKey = config_1.default.rag_api_key;
    try {
        let chat;
        let previousQuery;
        let previousAnswer;
        if (payload.chatId) {
            // ── Continue existing chat ──
            chat = yield chat_model_1.AIChat.findOne({ _id: payload.chatId, userId }).exec();
            if (!chat) {
                throw new Error('Chat not found');
            }
            // Grab latest user + assistant messages for context
            const messages = chat.messages;
            for (let i = messages.length - 1; i >= 0; i--) {
                if (!previousAnswer && messages[i].role === 'assistant') {
                    previousAnswer = messages[i].content;
                }
                if (!previousQuery && messages[i].role === 'user') {
                    previousQuery = messages[i].content;
                }
                if (previousQuery && previousAnswer)
                    break;
            }
        }
        else {
            // ── First message → create new chat with title = question ──
            chat = yield chat_model_1.AIChat.create({
                userId,
                title: payload.question.trim().slice(0, 100),
                messages: [],
            });
        }
        // Save user message
        chat.messages.push({
            role: 'user',
            content: payload.question,
            timestamp: new Date(),
        });
        // Build RAG payload
        const ragPayload = { query: payload.question };
        if (previousQuery)
            ragPayload.previous_query = previousQuery;
        if (previousAnswer)
            ragPayload.previous_answer = previousAnswer;
        const response = yield axios_1.default.post(`${ragHost}/api/v1/rag/query`, ragPayload, {
            headers: {
                'x-auth-key': ragApiKey,
                'Content-Type': 'application/json',
            },
        });
        // Save assistant message
        chat.messages.push({
            role: 'assistant',
            content: response.data.answer,
            timestamp: new Date(),
            isSourceVerified: (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.source_verified,
            sources: ((_c = (_b = response === null || response === void 0 ? void 0 : response.data) === null || _b === void 0 ? void 0 : _b.sources) !== null && _c !== void 0 ? _c : []).map((src) => ({
                fileType: src.file_type,
                displayName: src.display_name,
                pages: src.pages_display,
                location: src.location,
                chapter: src.chapter,
                subChapter: src.subchapter,
                section: src.section,
            })),
        });
        yield chat.save();
        return Object.assign({ chatId: chat._id, title: chat.title }, response.data);
    }
    catch (error) {
        console.error('Error calling RAG host:', ((_d = error.response) === null || _d === void 0 ? void 0 : _d.data) || error.message);
        throw error;
    }
});
//Get all chats for a user
const getUserChats = (userId_1, filters_1, ...args_1) => __awaiter(void 0, [userId_1, filters_1, ...args_1], void 0, function* (userId, filters, skip = 0, limit = 10) {
    const query = { userId: userId };
    if (filters === null || filters === void 0 ? void 0 : filters.keyword) {
        const escaped = filters.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.title = { $regex: escaped, $options: 'i' };
    }
    const result = yield (0, infinitePaginate_1.infinitePaginate)(chat_model_1.AIChat, query, skip, limit, []);
    return result;
});
//Get a single chat by ID
const getChatById = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findOne({
        _id: new mongoose_1.Types.ObjectId(chatId),
        userId: new mongoose_1.Types.ObjectId(userId)
    });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    return chat;
});
//Update chat title
const updateChatTitle = (chatId, userId, title) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findOneAndUpdate({ _id: new mongoose_1.Types.ObjectId(chatId), userId: new mongoose_1.Types.ObjectId(userId) }, { title }, { new: true });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
    return chat;
});
//Delete a chat (soft delete)
const deleteChat = (chatId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.AIChat.findByIdAndDelete({ _id: new mongoose_1.Types.ObjectId(chatId), userId: new mongoose_1.Types.ObjectId(userId) });
    if (!chat) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    }
});
exports.ChatServices = {
    askQuestion,
    getUserChats,
    getChatById,
    updateChatTitle,
    deleteChat,
};
