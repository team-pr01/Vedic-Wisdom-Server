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
exports.ConversationControllers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const conversation_service_1 = require("./conversation.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const socket_1 = require("../../socket");
const accessChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { targetUserId } = req.params;
    const userId = req.user.userId;
    const result = yield conversation_service_1.ConversationServices.accessChat(userId, targetUserId);
    if ((result === null || result === void 0 ? void 0 : result.messageRequestStatus) === "pending" && ((_a = result === null || result === void 0 ? void 0 : result.requestedBy) === null || _a === void 0 ? void 0 : _a.toString()) === userId) {
        const io = (0, socket_1.getIO)();
        // 1. Notify the Receiver (so it pops up in their list)
        io.to(targetUserId).emit("newMessageRequest", result);
        // 2. Notify the Sender (so YOUR list updates instantly without refreshing)
        io.to(userId).emit("newMessageRequest", result);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat accessed successfully",
        data: result,
    });
}));
const handleMessageRequest = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const { action } = req.body;
    const userId = req.user.userId;
    const result = yield conversation_service_1.ConversationServices.handleMessageRequest(conversationId, userId, action);
    if (action === "accepted") {
        const io = (0, socket_1.getIO)();
        // We emit a special event that tells the frontend to join the room
        io.to(userId.toString()).emit("requestAcceptedJoinRoom", conversationId);
        // Also tell the other user (the sender) to join the room
        const otherUser = result.members.find((m) => m.toString() !== userId);
        if (otherUser) {
            io.to(otherUser.toString()).emit("requestAcceptedJoinRoom", conversationId);
        }
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Message request ${action}`,
        data: result,
    });
}));
const getMyInbox = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield conversation_service_1.ConversationServices.getMyInbox(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Inbox fetched successfully",
        data: result,
    });
}));
const createGroupChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const userId = req.user.userId;
    const { groupName, groupAvatar, members } = req.body;
    const result = yield conversation_service_1.ConversationServices.createGroupChat(userId, {
        groupName,
        groupAvatar,
        members,
    }, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Group chat created successfully",
        data: result,
    });
}));
// Delete Chat (1-on-1 or Group)
const deleteChatForUser = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const result = yield conversation_service_1.ConversationServices.deleteChatForUser(conversationId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Chat deleted successfully",
        data: result,
    });
}));
// ✅ 2. Leave Group
const leaveGroup = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const result = yield conversation_service_1.ConversationServices.leaveGroup(conversationId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "You have left the group successfully",
        data: result,
    });
}));
exports.ConversationControllers = {
    accessChat,
    handleMessageRequest,
    getMyInbox,
    createGroupChat,
    deleteChatForUser,
    leaveGroup
};
