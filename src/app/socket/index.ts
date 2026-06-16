/* eslint-disable @typescript-eslint/no-explicit-any */
import { Server as SocketIOserver } from "socket.io";
import Message from "../modules/message/message.model";
import { Server } from "http";
import { Chat } from "../modules/chat/chat.model";
import { ChatServices } from "../modules/chat/chat.service";

export let io: SocketIOserver;
const setupSocket = (server: Server) => {
    const io = new SocketIOserver(server, {
        cors: {
            origin: ["http://localhost:5173"],
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
            credentials: true,
        },
    });

    const userSocketMap = new Map();

    const sendMessage = async (message: any) => {
        const senderId = typeof message.sender === 'string'
            ? message.sender
            : message.sender?._id;

        const receiverId = typeof message.receiver === 'string'
            ? message.receiver
            : message.receiver?._id;

        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);
        console.log("Temp ID:", message.tempId);

        const senderSocketId = userSocketMap.get(senderId);
        const receiverSocketId = userSocketMap.get(receiverId);

        try {
            // Find or create chat
            let chat = await Chat.findOne({
                participants: { $all: [senderId, receiverId] }
            });

            if (!chat) {
                chat = await Chat.create({
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

            const createdMessage = await Message.create(messageData);

            // Update chat with last message
            chat.lastMessage = createdMessage._id;
            chat.lastMessageAt = createdMessage.createdAt;
            await chat.save();

            // Populate message
            const populatedMessage = await Message.findById(createdMessage._id)
                .populate("sender", "_id name email profilePicture")
                .populate("receiver", "_id name email profilePicture");

            console.log("✅ Message created:", populatedMessage?._id);

            const responseMessage = {
                ...populatedMessage?.toObject(),
                tempId: message.tempId,
            };

            // ✅ Send to receiver
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", populatedMessage);
                console.log("📤 Sent to receiver:", receiverId);
                
                // ✅ Update receiver's chat list in real-time
                const receiverChatList = await ChatServices.getChatList(receiverId);
                io.to(receiverSocketId).emit("updateChatList", receiverChatList);
            }

            // ✅ Send confirmation to sender
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSent", responseMessage);
                console.log("📤 Sent confirmation to sender:", senderId);
                
                // ✅ Update sender's chat list in real-time
                const senderChatList = await ChatServices.getChatList(senderId);
                io.to(senderSocketId).emit("updateChatList", senderChatList);
            }

            // ✅ If sender is offline, save for later
            if (!senderSocketId) {
                console.log("⚠️ Sender is offline, message saved but not delivered");
            }

        } catch (error) {
            console.error("❌ Error sending message:", error);
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageError", {
                    tempId: message.tempId,
                    error: "Failed to send message",
                });
            }
        }
    };

    io.on("connection", (socket) => {
        const userId = socket.handshake.query.userId as string;

        if (userId) {
            userSocketMap.set(userId, socket.id);
            console.log(`✅ User connected: ${userId} with socket ID: ${socket.id}`);
            console.log(`📊 Online users: ${userSocketMap.size}`);

            // ✅ Send updated chat list on connection
            (async () => {
                const chatList = await ChatServices.getChatList(userId);
                socket.emit("updateChatList", chatList);
            })();

            const onlineUsers = Array.from(userSocketMap.keys());
            io.emit("onlineUsers", onlineUsers);
            socket.broadcast.emit("userOnline", userId);
        } else {
            console.log("❌ User ID not provided during connection.");
        }

        socket.on("sendMessage", (message) => {
            console.log("📩 Received sendMessage event:", message);
            sendMessage(message);
        });

        socket.on("typing", ({ sender, receiver, isTyping }) => {
            const receiverSocketId = userSocketMap.get(receiver);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("userTyping", {
                    sender,
                    isTyping,
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`❌ Client Disconnected: ${socket.id}`);
            for (const [userId, socketId] of userSocketMap.entries()) {
                if (socketId === socket.id) {
                    userSocketMap.delete(userId);
                    console.log(`👤 User removed: ${userId}`);
                    socket.broadcast.emit("userOffline", userId);
                    const onlineUsers = Array.from(userSocketMap.keys());
                    io.emit("onlineUsers", onlineUsers);
                    break;
                }
            }
        });
    });

    return io;
};

export default setupSocket;