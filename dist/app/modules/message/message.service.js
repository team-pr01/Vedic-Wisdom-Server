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
exports.MessageServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const message_model_1 = __importDefault(require("./message.model"));
const socket_1 = require("../../socket");
const chat_service_1 = require("../chat/chat.service");
/* Get Messages Between Two Users */
const getMessages = (userId_1, otherUserId_1, ...args_1) => __awaiter(void 0, [userId_1, otherUserId_1, ...args_1], void 0, function* (userId, otherUserId, skip = 0, limit = 50) {
    const messages = yield message_model_1.default.find({
        $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
        ]
    })
        .populate("sender", "_id name profilePicture")
        .populate("receiver", "_id name profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    // Mark messages as read (optional)
    yield message_model_1.default.updateMany({
        sender: otherUserId,
        receiver: userId,
        isRead: false
    }, { isRead: true });
    return messages.reverse(); // Return in chronological order
});
/* Get Unread Count */
const markMessagesAsRead = (userId, otherUserId) => __awaiter(void 0, void 0, void 0, function* () {
    // Update all unread messages from other user to current user
    const result = yield message_model_1.default.updateMany({
        sender: otherUserId,
        receiver: userId,
        isRead: false,
    }, {
        isRead: true,
        status: "read",
    });
    if (socket_1.io && result.modifiedCount > 0) {
        // Get socket IDs
        const userSocketId = socket_1.userSocketMap.get(userId);
        const otherUserSocketId = socket_1.userSocketMap.get(otherUserId);
        // Get updated chat lists
        const userChatList = yield chat_service_1.ChatServices.getChatList(userId);
        const otherUserChatList = yield chat_service_1.ChatServices.getChatList(otherUserId);
        // Send updated chat list to current user
        if (userSocketId) {
            socket_1.io.to(userSocketId).emit("updateChatList", userChatList);
        }
        // Send updated chat list to the other user
        if (otherUserSocketId) {
            socket_1.io.to(otherUserSocketId).emit("updateChatList", otherUserChatList);
        }
    }
    return {
        success: true,
        message: "Messages marked as read",
        modifiedCount: result.modifiedCount,
    };
});
/* Get Unread Count for a Specific User */
const getUnreadCountWithUser = (userId, otherUserId) => __awaiter(void 0, void 0, void 0, function* () {
    const count = yield message_model_1.default.countDocuments({
        sender: otherUserId,
        receiver: userId,
        isRead: false,
    });
    return count;
});
exports.MessageServices = {
    getMessages,
    markMessagesAsRead,
    getUnreadCountWithUser
};
