/* eslint-disable @typescript-eslint/no-explicit-any */
import Message from "./message.model";
import { io, userSocketMap } from "../../socket";
import { ChatServices } from "../chat/chat.service";

/* Get Messages Between Two Users */
const getMessages = async (userId: string, otherUserId: string, skip = 0, limit = 50) => {
    const messages = await Message.find({
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
    await Message.updateMany(
        {
            sender: otherUserId,
            receiver: userId,
            isRead: false
        },
        { isRead: true }
    );

    return messages.reverse(); // Return in chronological order
};

/* Get Unread Count */
const markMessagesAsRead = async (userId: string, otherUserId: string) => {
    // Update all unread messages from other user to current user
    const result = await Message.updateMany(
        {
            sender: otherUserId,
            receiver: userId,
            isRead: false,
        },
        {
            isRead: true,
            status: "read",
        }
    );

    if (io && result.modifiedCount > 0) {
        // Get socket IDs
        const userSocketId = userSocketMap.get(userId);
        const otherUserSocketId = userSocketMap.get(otherUserId);

        // Get updated chat lists
        const userChatList = await ChatServices.getChatList(userId);
        const otherUserChatList = await ChatServices.getChatList(otherUserId);

        // Send updated chat list to current user
        if (userSocketId) {
            io.to(userSocketId).emit("updateChatList", userChatList);
        }

        // Send updated chat list to the other user
        if (otherUserSocketId) {
            io.to(otherUserSocketId).emit("updateChatList", otherUserChatList);
        }
    }

    return {
        success: true,
        message: "Messages marked as read",
        modifiedCount: result.modifiedCount,
    };
};

/* Get Unread Count for a Specific User */
const getUnreadCountWithUser = async (userId: string, otherUserId: string) => {
    const count = await Message.countDocuments({
        sender: otherUserId,
        receiver: userId,
        isRead: false,
    });
    return count;
};

export const MessageServices = {
    getMessages,
    markMessagesAsRead,
    getUnreadCountWithUser
};