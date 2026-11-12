/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Server } from "socket.io";
import http from "http";
import { Conversation } from "../modules/conversation/conversation.model";
import { Message } from "../modules/conversation/message/message.model";
import { User } from "../modules/auth/auth.model";

let ioInstance: Server;
export const onlineUsers = new Map();

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

            // 1. Broadcast initial online list
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

            // 2. Broadcast to everyone that this user just came online
            io.emit("userStatusChanged", { userId, isOnline: true });

            // Join all their conversation rooms
            const userConversations = await Conversation.find({
                members: userId,
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
            const { conversationId, senderId, text, mentions = [] } = data;

            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            // 1. Check if user left the group
            if (conversation.isGroup && conversation.leftMembers?.some(id => id.toString() === senderId.toString())) {
                return socket.emit("messageError", { message: "You are no longer in this group." });
            }

            // 2. Check Block status
            // Did I block someone else?
            const hasSenderBlockedOther = conversation.blockedBy?.some(
                (id) => id.toString() === senderId.toString()
            );
            if (hasSenderBlockedOther) {
                return socket.emit("messageError", { message: "Unblock the user to send messages." });
            }

            // Did someone else block me?
            const isSenderBlockedByOther = conversation.blockedBy?.some(
                (id) => id.toString() !== senderId.toString()
            );

            // 3. Save to DB (Always save so the sender sees it)
            const newMessage = await Message.create({
                conversationId,
                sender: senderId,
                text,
                mentions,
            });

            const updatedDeletedBy = conversation?.deletedBy?.filter(
                (record: any) => record.user.toString() === senderId.toString()
            );

            // 4. Update conversation lastMessage
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                deletedBy: updatedDeletedBy
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate("sender", "name profilePicture");

            // 5. Emit Logic based on block status
            if (isSenderBlockedByOther) {
                // If I am blocked, only send the message back to ME (the sender)
                // so my screen updates, but the other person never receives it.
                io.to(senderId).emit("receiveMessage", populatedMessage);
            } else {
                // Normal flow: Emit to everyone in the room
                io.to(conversationId).emit("receiveMessage", populatedMessage);
            }

            mentions.forEach((taggedUserId: string) => {
                if (taggedUserId !== senderId) {
                    io.to(taggedUserId).emit("youWereMentioned", populatedMessage);
                }
            });
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
        socket.on("disconnect", async () => {
            // Remove from online users
            const userId = [...onlineUsers.entries()].find(([_, id]) => id === socket.id)?.[0];
            if (userId) {
                onlineUsers.delete(userId);
                io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

                // 1. Generate the timestamp
                const lastActiveAt = new Date();

                // 2. Save it to the Database
                await User.findByIdAndUpdate(userId, { lastActiveAt });

                // 3. Broadcast it to everyone
                io.emit("userStatusChanged", {
                    userId,
                    isOnline: false,
                    lastActiveAt
                });
            }
        });

        // 6. Join a new group
        socket.on("joinNewGroup", (conversationId) => {
            socket.join(conversationId);
        });
    });
};
export const getIO = () => {
    if (!ioInstance) throw new Error("Socket.io not initialized!");
    return ioInstance;
};

export const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
};