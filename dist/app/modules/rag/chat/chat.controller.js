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
exports.ChatControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const chat_service_1 = require("./chat.service");
//Create a new chat
const createChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { title, initialMessage } = req.body;
    const chat = yield chat_service_1.ChatServices.createChat(userId, {
        title: title || "New Chat",
        initialMessage,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Chat created successfully",
        data: chat,
    });
}));
//Get all chats for the user
const getUserChats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { page, limit, search, category, sortBy } = req.query;
    const query = {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        search: search || "",
        category: category || "",
        sortBy: sortBy || "newest",
    };
    const result = yield chat_service_1.ChatServices.getUserChats(userId, query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chats fetched successfully",
        data: result,
    });
}));
//Get a single chat by ID
const getChatById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const chat = yield chat_service_1.ChatServices.getChatById(chatId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat fetched successfully",
        data: chat,
    });
}));
//Update chat title
const updateChatTitle = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { title } = req.body;
    if (!title || title.trim().length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Title is required",
            data: null,
        });
    }
    const chat = yield chat_service_1.ChatServices.updateChatTitle(chatId, userId, title.trim());
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat title updated successfully",
        data: chat,
    });
}));
//Delete a chat
const deleteChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { chatId } = req.params;
    yield chat_service_1.ChatServices.deleteChat(chatId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat deleted successfully",
        data: null,
    });
}));
//Delete all chats
const deleteAllChats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const count = yield chat_service_1.ChatServices.deleteAllChats(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${count} chats deleted successfully`,
        data: { deletedCount: count },
    });
}));
//Send a message in a chat
const sendMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const { message, language, category } = req.body;
    if (!message || message.trim().length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            success: false,
            message: "Message cannot be empty",
            data: null,
        });
    }
    const result = yield chat_service_1.ChatServices.sendMessage(chatId, userId, message.trim(), { language, category });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message sent successfully",
        data: result,
    });
}));
//Regenerate the last assistant message
const regenerateLastMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const result = yield chat_service_1.ChatServices.regenerateLastMessage(chatId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message regenerated successfully",
        data: result,
    });
}));
exports.ChatControllers = {
    createChat,
    getUserChats,
    getChatById,
    updateChatTitle,
    deleteChat,
    deleteAllChats,
    sendMessage,
    regenerateLastMessage,
};
