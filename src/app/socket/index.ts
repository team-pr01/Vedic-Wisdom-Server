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

    io.on("connection", (socket) => {
        // 1. User connects and registers their ID
        socket.on("addUser", async (userId) => {
            onlineUsers.set(userId, socket.id);
            socket.join(userId);

            // 1. Broadcast initial online list
            io.emit("getOnlineUsers", Array.from(onlineUsers.keys()));

            // 2. Broadcast to everyone that this user just came online
            io.emit("userStatusChanged", { userId, isOnline: true });

            const undeliveredMessages = await Message.find({
                "deliveredTo.userId": { $ne: userId },
                sender: { $ne: userId } // Don't mark own messages
            });

            if (undeliveredMessages.length > 0) {
                const messageIds = undeliveredMessages.map(m => m._id);

                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { $push: { deliveredTo: { userId, deliveredAt: new Date() } } }
                );

                // Notify the senders so their UI updates to double ticks
                undeliveredMessages.forEach((msg) => {
                    io.to(msg.conversationId.toString()).emit("messageDeliveredToUser", {
                        messageId: msg._id,
                        userId,
                    });
                });
            }

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
            const { conversationId, senderId, text, mentions = [], tempId, replyTo, } = data;

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
                replyTo,
            });

            const messageCreatedAt = newMessage?.createdAt instanceof Date
                ? newMessage.createdAt
                : new Date();

            const updatedDeletedBy = conversation?.deletedBy?.map((record: any) => {
                return {
                    user: record.user,
                    // Set their new cutoff time to exactly the time of this new message
                    deletedAt: new Date(messageCreatedAt.getTime() - 1),
                };
            }) || [];

            // 4. Update conversation lastMessage
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                deletedBy: updatedDeletedBy
            });

            const populatedMessage = await Message.findById(newMessage._id)
                .populate("sender", "name profilePicture")
                .populate({
                    path: "replyTo",
                    select: "text sender isDeletedForEveryone",
                    populate: { path: "sender", select: "name" }
                });

            const messageWithTempId = {
                ...populatedMessage?.toObject(), // Convert Mongoose doc to plain object
                tempId: tempId
            };

            // 5. Emit Logic based on block status
            if (isSenderBlockedByOther) {
                // If I am blocked, only send the message back to ME (the sender)
                // so my screen updates, but the other person never receives it.
                io.to(senderId).emit("receiveMessage", messageWithTempId);
            } else {
                // Normal flow: Emit to everyone in the room
                io.to(conversationId).emit("receiveMessage", messageWithTempId);
            }

            mentions.forEach((taggedUserId: string) => {
                if (taggedUserId !== senderId) {
                    io.to(taggedUserId).emit("youWereMentioned", messageWithTempId);
                }
            });
        });

        socket.on("messageDelivered", async ({ messageId, userId }) => {
            const message = await Message.findById(messageId);
            if (message) {
                // Check if already delivered to avoid duplicates
                const alreadyDelivered = message.deliveredTo?.some(
                    (d) => d.userId.toString() === userId.toString()
                );

                if (!alreadyDelivered) {
                    message.deliveredTo = message.deliveredTo || [];
                    message.deliveredTo.push({ userId, deliveredAt: new Date() });
                    await message.save();

                    // Tell the sender instantly
                    io.to(message.conversationId.toString()).emit("messageDeliveredToUser", {
                        messageId,
                        userId,
                    });
                }
            }
        });

        // backend/socket.ts

        socket.on("messageRead", async ({ conversationId, userId }) => {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            const now = new Date();

            // 1. Find all unread messages sent by OTHERS in this conversation
            const unreadMessages = await Message.find({
                conversationId,
                sender: { $ne: userId },
                readBy: { $ne: userId }
            });

            if (unreadMessages.length === 0) return;

            // 2. Mark them as read by this user
            const messageIds = unreadMessages.map(m => m._id);
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $addToSet: { readBy: userId } }
            );

            // 3. Check for Auto-Delete condition
            for (const msg of unreadMessages) {
                // Note: We add userId to the local array for accurate counting
                const updatedReadBy = [...(msg.readBy || []), userId];

                let shouldDelete = false;

                if (conversation.isGroup) {
                    // Group: Check if EVERYONE has read it
                    // Total expected readers = total members - 1 (sender)
                    // (Assuming sender is still in the group, adjust if needed)
                    const expectedReaders = conversation.members.length - 1;

                    // Remove duplicates just in case
                    const uniqueReaders = new Set(updatedReadBy.map(id => id.toString()));

                    if (uniqueReaders.size >= expectedReaders) {
                        shouldDelete = true;
                    }
                } else {
                    // 1-on-1: Check if the other person has read it
                    // Since we queried `sender: { $ne: userId }`, if it's here, we are the receiver reading it.
                    shouldDelete = true;
                }

                // 4. Set the deleteAt time (Now + 5 minutes)
                if (shouldDelete) {
                    const deleteAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
                    await Message.findByIdAndUpdate(msg._id, { deleteAt });
                }
            }

            // 5. Broadcast to the room so UIs update the ticks
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