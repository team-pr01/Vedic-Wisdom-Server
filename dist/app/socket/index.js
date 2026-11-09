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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.initSocket = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
const socket_io_1 = require("socket.io");
const conversation_model_1 = require("../modules/conversation/conversation.model");
const message_model_1 = require("../modules/conversation/message/message.model");
let ioInstance;
const initSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: { origin: "*" }, // Configure to your frontend URL in production
    });
    ioInstance = io;
    // Store online users: userId -> socketId
    const onlineUsers = new Map();
    io.on("connection", (socket) => {
        // 1. User connects and registers their ID
        socket.on("addUser", (userId) => __awaiter(void 0, void 0, void 0, function* () {
            onlineUsers.set(userId, socket.id);
            socket.join(userId);
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            // Automatically join ALL of the user's conversation rooms
            // This ensures they get real-time inbox updates even if they aren't in the ChatWindow
            const userConversations = yield conversation_model_1.Conversation.find({ members: userId });
            userConversations.forEach((convo) => {
                socket.join(convo._id.toString());
            });
        }));
        // 2. Join a specific chat room
        socket.on("joinRoom", (conversationId) => {
            socket.join(conversationId);
        });
        // 3. Send Message
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const { conversationId, senderId, text } = data;
            // Save to DB
            const newMessage = yield message_model_1.Message.create({
                conversationId,
                sender: senderId,
                text,
            });
            // Update conversation lastMessage
            const conversation = yield conversation_model_1.Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id });
            if ((conversation === null || conversation === void 0 ? void 0 : conversation.isGroup) && ((_a = conversation === null || conversation === void 0 ? void 0 : conversation.leftMembers) === null || _a === void 0 ? void 0 : _a.includes(senderId))) {
                return socket.emit("messageError", { message: "You are no longer in this group." });
            }
            const populatedMessage = yield message_model_1.Message.findById(newMessage._id)
                .populate("sender", "name profilePicture");
            // Emit to everyone in the room (including sender)
            io.to(conversationId).emit("receiveMessage", populatedMessage);
        }));
        socket.on("messageRead", (_a) => __awaiter(void 0, [_a], void 0, function* ({ conversationId, userId }) {
            // 1. Update all messages in this conversation sent by the OTHER user
            yield message_model_1.Message.updateMany({
                conversationId,
                sender: { $ne: userId } // Don't mark our own messages as read by us
            }, {
                $addToSet: { readBy: userId } // Add user to readBy array
            });
            // 2. Broadcast to the room
            socket.to(conversationId).emit("messagesMarkedAsRead", { conversationId, userId });
        }));
        // Listen for when a request is accepted/rejected to update both sides
        socket.on("requestStatusChanged", ({ targetUserId, conversationId, status }) => {
            io.to(targetUserId).emit("requestUpdated", { conversationId, status });
        });
        // 4. Typing Indicator
        socket.on("typing", ({ conversationId, userId, userName, isTyping }) => {
            socket.to(conversationId).emit("userTyping", { userId, userName, isTyping });
        });
        // 5. Disconnect
        socket.on("disconnect", () => {
            var _a;
            // Remove from online users
            const userId = (_a = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
            if (userId) {
                onlineUsers.delete(userId);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!ioInstance)
        throw new Error("Socket.io not initialized!");
    return ioInstance;
};
exports.getIO = getIO;
