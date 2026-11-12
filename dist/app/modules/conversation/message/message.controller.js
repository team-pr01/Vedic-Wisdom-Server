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
exports.MessageControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const message_service_1 = require("./message.service");
const getMessages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { skip = "0", limit = "20" } = req.query;
    const userId = req.user.userId;
    const result = yield message_service_1.MessageServices.getMessages(conversationId, userId, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Messages fetched successfully",
        data: result,
    });
}));
const reactToMessage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const { emoji, method } = req.body;
    const userId = req.user.userId;
    const result = yield message_service_1.MessageServices.reactToMessage(messageId, userId, emoji, method || "add");
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Reaction ${method === "remove" ? "removed" : "added"} successfully`,
        data: result,
    });
}));
const deleteMessageForMe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const result = yield message_service_1.MessageServices.deleteMessageForMe(messageId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message deleted for you",
        data: result,
    });
}));
// Unsend (Delete for Everyone)
const deleteMessageForEveryone = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { messageId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const result = yield message_service_1.MessageServices.deleteMessageForEveryone(messageId, userId, userRole);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Message unsent for everyone",
        data: result,
    });
}));
exports.MessageControllers = {
    getMessages,
    reactToMessage,
    deleteMessageForMe,
    deleteMessageForEveryone
};
