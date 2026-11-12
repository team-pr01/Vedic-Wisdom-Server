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
exports.isUserOnline = exports.getIO = exports.initSocket = exports.onlineUsers = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
const socket_io_1 = require("socket.io");
const conversation_model_1 = require("../modules/conversation/conversation.model");
const message_model_1 = require("../modules/conversation/message/message.model");
const auth_model_1 = require("../modules/auth/auth.model");
let ioInstance;
exports.onlineUsers = new Map();
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
            // 1. Broadcast initial online list
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            // 2. Broadcast to everyone that this user just came online
            io.emit("userStatusChanged", { userId, isOnline: true });
            // Join all their conversation rooms
            const userConversations = yield conversation_model_1.Conversation.find({
                members: userId,
                leftMembers: { $ne: userId }
            });
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
            var _a, _b, _c, _d;
            const { conversationId, senderId, text, mentions = [], tempId } = data;
            const conversation = yield conversation_model_1.Conversation.findById(conversationId);
            if (!conversation)
                return;
            // 1. Check if user left the group
            if (conversation.isGroup && ((_a = conversation.leftMembers) === null || _a === void 0 ? void 0 : _a.some(id => id.toString() === senderId.toString()))) {
                return socket.emit("messageError", { message: "You are no longer in this group." });
            }
            // 2. Check Block status
            // Did I block someone else?
            const hasSenderBlockedOther = (_b = conversation.blockedBy) === null || _b === void 0 ? void 0 : _b.some((id) => id.toString() === senderId.toString());
            if (hasSenderBlockedOther) {
                return socket.emit("messageError", { message: "Unblock the user to send messages." });
            }
            // Did someone else block me?
            const isSenderBlockedByOther = (_c = conversation.blockedBy) === null || _c === void 0 ? void 0 : _c.some((id) => id.toString() !== senderId.toString());
            // 3. Save to DB (Always save so the sender sees it)
            const newMessage = yield message_model_1.Message.create({
                conversationId,
                sender: senderId,
                text,
                mentions,
            });
            const messageCreatedAt = (newMessage === null || newMessage === void 0 ? void 0 : newMessage.createdAt) instanceof Date
                ? newMessage.createdAt
                : new Date();
            const updatedDeletedBy = ((_d = conversation === null || conversation === void 0 ? void 0 : conversation.deletedBy) === null || _d === void 0 ? void 0 : _d.map((record) => {
                return {
                    user: record.user,
                    // Set their new cutoff time to exactly the time of this new message
                    deletedAt: new Date(messageCreatedAt.getTime() - 1),
                };
            })) || [];
            // 4. Update conversation lastMessage
            yield conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                deletedBy: updatedDeletedBy
            });
            const populatedMessage = yield message_model_1.Message.findById(newMessage._id)
                .populate("sender", "name profilePicture");
            const messageWithTempId = Object.assign(Object.assign({}, populatedMessage === null || populatedMessage === void 0 ? void 0 : populatedMessage.toObject()), { tempId: tempId });
            // 5. Emit Logic based on block status
            if (isSenderBlockedByOther) {
                // If I am blocked, only send the message back to ME (the sender)
                // so my screen updates, but the other person never receives it.
                io.to(senderId).emit("receiveMessage", messageWithTempId);
            }
            else {
                // Normal flow: Emit to everyone in the room
                io.to(conversationId).emit("receiveMessage", messageWithTempId);
            }
            mentions.forEach((taggedUserId) => {
                if (taggedUserId !== senderId) {
                    io.to(taggedUserId).emit("youWereMentioned", messageWithTempId);
                }
            });
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
        socket.on("leaveRoom", (conversationId) => {
            socket.leave(conversationId);
        });
        // 5. Disconnect
        socket.on("disconnect", () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            // Remove from online users
            const userId = (_a = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)) === null || _a === void 0 ? void 0 : _a[0];
            if (userId) {
                onlineUsers.delete(userId);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
                // 1. Generate the timestamp
                const lastActiveAt = new Date();
                // 2. Save it to the Database
                yield auth_model_1.User.findByIdAndUpdate(userId, { lastActiveAt });
                // 3. Broadcast it to everyone
                io.emit("userStatusChanged", {
                    userId,
                    isOnline: false,
                    lastActiveAt
                });
            }
        }));
        // 6. Join a new group
        socket.on("joinNewGroup", (conversationId) => {
            socket.join(conversationId);
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
const isUserOnline = (userId) => {
    return exports.onlineUsers.has(userId);
};
exports.isUserOnline = isUserOnline;
