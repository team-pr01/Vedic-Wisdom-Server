/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from "socket.io";
import http from "http";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message } from "../modules/conversation/message/message.model";

let ioInstance: Server;

export const initSocket = (server: http.Server) => {
    const io = new Server(server, {
        cors: { origin: "*" }, // Configure to your frontend URL in production
    });
    ioInstance = io;

    // Store online users: userId -> socketId
    const onlineUsers = new Map();

    io.on("connection", (socket) => {
        // 1. User connects and registers their ID
        socket.on("addUser", async (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.join(userId);
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

            const userConversations = await Conversation.find({
                members: userId,
                // Find groups where they are NOT in the leftMembers array
                leftMembers: { $ne: userId } 
            });
            
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

            const conversation = await Conversation.findById(conversationId);
            if (conversation?.isGroup && conversation?.leftMembers?.some(id => id.toString() === senderId.toString())) {
                return socket.emit("messageError", { message: "You are no longer in this group." });
            }


            // Save to DB
            const newMessage = await Message.create({
                conversationId,
                sender: senderId,
                text,
            });

            const updatedDeletedBy = conversation?.deletedBy?.filter(
                (record: any) => record.user.toString() === senderId.toString()
            );

            // Update conversation lastMessage
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                deletedBy: updatedDeletedBy
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate("sender", "name profilePicture");

            // Emit to everyone in the room (including sender)
            io.to(conversationId).emit("receiveMessage", populatedMessage);
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
export const getIO = () => {
    if (!ioInstance) throw new Error("Socket.io not initialized!");
    return ioInstance;
};