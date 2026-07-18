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
exports.userSocketMap = exports.io = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const socket_io_1 = require("socket.io");
const message_model_1 = __importDefault(require("../modules/message/message.model"));
const chat_model_1 = __importDefault(require("../modules/chat/chat.model"));
const chat_service_1 = require("../modules/chat/chat.service");
exports.userSocketMap = new Map();
const setupSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: ["http://localhost:5173"],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        },
    });
    const sendMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        const senderId = typeof message.sender === 'string'
            ? message.sender
            : (_a = message.sender) === null || _a === void 0 ? void 0 : _a._id;
        const receiverId = typeof message.receiver === 'string'
            ? message.receiver
            : (_b = message.receiver) === null || _b === void 0 ? void 0 : _b._id;
        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);
        console.log("Temp ID:", message.tempId);
        const senderSocketId = exports.userSocketMap.get(senderId);
        const receiverSocketId = exports.userSocketMap.get(receiverId);
        try {
            // Find or create chat
            let chat = yield chat_model_1.default.findOne({
                participants: { $all: [senderId, receiverId] }
            });
            if (!chat) {
                chat = yield chat_model_1.default.create({
                    participants: [senderId, receiverId],
                    isActive: true,
                });
                console.log("New chat created:", chat._id);
            }
            // Create message
            const messageData = {
                sender: senderId,
                receiver: receiverId,
                content: message.content,
                messageType: message.messageType || "text",
            };
            const createdMessage = yield message_model_1.default.create(messageData);
            // Update chat with last message
            chat.lastMessage = createdMessage._id;
            chat.lastMessageAt = createdMessage.createdAt;
            yield chat.save();
            // Populate message
            const populatedMessage = yield message_model_1.default.findById(createdMessage._id)
                .populate("sender", "_id name email profilePicture")
                .populate("receiver", "_id name email profilePicture");
            console.log("✅ Message created:", populatedMessage === null || populatedMessage === void 0 ? void 0 : populatedMessage._id);
            const responseMessage = Object.assign(Object.assign({}, populatedMessage === null || populatedMessage === void 0 ? void 0 : populatedMessage.toObject()), { tempId: message.tempId });
            // ✅ Send to receiver
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
                console.log("📤 Sent to receiver:", receiverId);
                // ✅ Update receiver's chat list in real-time
                const receiverChatList = yield chat_service_1.ChatServices.getChatList(receiverId);
                console.log("Receiver chat list", receiverChatList);
                io.to(receiverSocketId).emit("updateChatList", receiverChatList);
            }
            // ✅ Send confirmation to sender
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSent", responseMessage);
                console.log("📤 Sent confirmation to sender:", senderId);
                // ✅ Update sender's chat list in real-time
                const senderChatList = yield chat_service_1.ChatServices.getChatList(senderId);
                console.log("Sender chat list", senderChatList);
                io.to(senderSocketId).emit("updateChatList", senderChatList);
            }
            // ✅ If sender is offline, save for later
            if (!senderSocketId) {
                console.log("⚠️ Sender is offline, message saved but not delivered");
            }
        }
        catch (error) {
            console.error("❌ Error sending message:", error);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageError", {
                    tempId: message.tempId,
                    error: "Failed to send message",
                });
            }
        }
    });
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId;
        if (userId) {
            exports.userSocketMap.set(userId, socket.id);
            console.log(`✅ User connected: ${userId} with socket ID: ${socket.id}`);
            console.log(`📊 Online users: ${exports.userSocketMap.size}`);
            // ✅ Send updated chat list on connection
            (() => __awaiter(void 0, void 0, void 0, function* () {
                const chatList = yield chat_service_1.ChatServices.getChatList(userId);
                socket.emit("updateChatList", chatList);
            }))();
            const onlineUsers = Array.from(exports.userSocketMap.keys());
            io.emit("onlineUsers", onlineUsers);
            socket.broadcast.emit("userOnline", userId);
        }
        else {
            console.log("❌ User ID not provided during connection.");
        }
        socket.on("sendMessage", (message) => {
            console.log("📩 Received sendMessage event:", message);
            sendMessage(message);
        });
        socket.on("typing", ({ sender, receiver, isTyping }) => {
            const receiverSocketId = exports.userSocketMap.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", {
                    sender,
                    isTyping,
                });
            }
        });
        socket.on("disconnect", () => {
            console.log(`❌ Client Disconnected: ${socket.id}`);
            for (const [userId, socketId] of exports.userSocketMap.entries()) {
                if (socketId === socket.id) {
                    exports.userSocketMap.delete(userId);
                    console.log(`👤 User removed: ${userId}`);
                    socket.broadcast.emit("userOffline", userId);
                    const onlineUsers = Array.from(exports.userSocketMap.keys());
                    io.emit("onlineUsers", onlineUsers);
                    break;
                }
            }
        });
    });
    return io;
};
exports.default = setupSocket;
