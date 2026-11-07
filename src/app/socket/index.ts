/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from "socket.io";
import http from "http";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message } from "../modules/conversation/message/message.model";

export const initSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: { origin: "*" }, // Configure to your frontend URL in production
    });

    // Store online users: userId -> socketId
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        // 1. User connects and registers their ID
        socket.on("addUser", async (userId) => {
            onlineUsers.set(userId, socket.id);
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

            // Automatically join ALL of the user's conversation rooms
            // This ensures they get real-time inbox updates even if they aren't in the ChatWindow
             const userConversations = await Conversation.find({ members: userId });
            userConversations.forEach((convo) => {
                socket.join(convo._id.toString());
            });
        });

        // 2. Join a specific chat room
        socket.on("joinRoom", (conversationId) => {
            socket.join(conversationId);
        });

        // 3. Send Message
        socket.on("sendMessage", async (data) => {
            const { conversationId, senderId, text } = data;

            // Save to DB
            const newMessage = await Message.create({
                conversationId,
                sender: senderId,
                text,
            });

            // Update conversation lastMessage
            await Conversation.findByIdAndUpdate(conversationId, { lastMessage: newMessage._id });

            // Emit to everyone in the room (including sender)
            io.to(conversationId).emit("receiveMessage", newMessage);
        });

        socket.on("messageRead", async ({ conversationId, userId }) => {
            // 1. Update all messages in this conversation sent by the OTHER user
            await Message.updateMany(
                {
                    conversationId,
                    sender: { $ne: userId } // Don't mark our own messages as read by us
                },
                {
                    $addToSet: { readBy: userId } // Add user to readBy array
                }
            );

            // 2. Broadcast to the room
            socket.to(conversationId).emit("messagesMarkedAsRead", { conversationId, userId });
        });

        // 4. Typing Indicator
        socket.on("typing", ({ conversationId, userId, isTyping }) => {
            socket.to(conversationId).emit("userTyping", { userId, isTyping });
        });

        // 5. Disconnect
        socket.on("disconnect", () => {
            // Remove from online users
            const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));
            }
        });
    });
};