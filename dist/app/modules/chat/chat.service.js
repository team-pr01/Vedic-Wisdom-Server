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
const message_model_1 = __importDefault(require("../message/message.model"));
const chat_model_1 = __importDefault(require("./chat.model"));
/* Get Chat List (Inbox) */
const getChatList = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const chats = yield chat_model_1.default.find({
        participants: userId,
        isActive: true,
    })
        .populate("participants", "_id name email profilePicture role")
        .populate("lastMessage", "content createdAt messageType isRead status")
        .sort({ lastMessageAt: -1 })
        .lean();
    const chatUsers = yield Promise.all(chats.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
        // Get the other participant
        const otherUser = chat.participants.find((p) => { var _a; return ((_a = p._id) === null || _a === void 0 ? void 0 : _a.toString()) !== userId; });
        if (!otherUser)
            return null;
        // ✅ Count unread messages from the other user to current user
        const unreadCount = yield message_model_1.default.countDocuments({
            sender: otherUser._id,
            receiver: userId,
            isRead: false,
        });
        const lastMessageData = chat.lastMessage;
        return {
            _id: otherUser._id,
            name: otherUser.name || "User",
            email: otherUser.email,
            profilePicture: otherUser.profilePicture,
            role: otherUser.role,
            lastMessage: (lastMessageData === null || lastMessageData === void 0 ? void 0 : lastMessageData.content) || "No messages yet",
            lastMessageTime: chat.lastMessageAt || null,
            messageType: (lastMessageData === null || lastMessageData === void 0 ? void 0 : lastMessageData.messageType) || "text",
            unreadCount: unreadCount,
            isRead: (lastMessageData === null || lastMessageData === void 0 ? void 0 : lastMessageData.isRead) || false,
            status: (lastMessageData === null || lastMessageData === void 0 ? void 0 : lastMessageData.status) || "sent",
        };
    })));
    // Filter out nulls and sort
    return chatUsers
        .filter(user => user !== null)
        .sort((a, b) => {
        if (!a.lastMessageTime)
            return 1;
        if (!b.lastMessageTime)
            return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
    });
});
const updateChatLastMessage = (senderId, receiverId, messageId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.default.findOne({
        participants: { $all: [senderId, receiverId] }
    });
    if (chat) {
        chat.lastMessage = messageId;
        chat.lastMessageAt = new Date();
        yield chat.save();
    }
});
exports.ChatServices = {
    getChatList,
    updateChatLastMessage
};
