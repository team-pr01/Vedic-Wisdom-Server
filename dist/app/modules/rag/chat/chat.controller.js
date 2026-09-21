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
//Ask a question to the Vedic knowledge base
const askQuestion = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield chat_service_1.ChatServices.askQuestion(req.body, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Answer generated successfully",
        data: result,
    });
}));
//Get all chats for the user
const getUserChats = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { keyword, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword
    };
    const result = yield chat_service_1.ChatServices.getUserChats(userId, filters, Number(skip), Number(limit));
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
exports.ChatControllers = {
    askQuestion,
    getUserChats,
    getChatById,
    updateChatTitle,
    deleteChat,
};
