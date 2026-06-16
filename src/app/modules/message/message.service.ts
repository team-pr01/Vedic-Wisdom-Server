/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { User } from "../auth/auth.model";
import Message from "./message.model";

/* Get Chat List (Inbox) */
const getChatList = async (userId: string) => {
    // Find all messages where user is either sender or receiver
    const messages = await Message.find({
        $or: [
            { sender: userId },
            { receiver: userId }
        ]
    })
        .sort({ createdAt: -1 })
        .lean();

    // Get unique user IDs from messages
    const chatUserIds = new Set<string>();
    const lastMessages: Record<string, any> = {};
    const unreadCounts: Record<string, number> = {};

    messages.forEach((message) => {
        const otherUserId = message.sender.toString() === userId
            ? message.receiver.toString()
            : message.sender.toString();

        if (otherUserId) {
            chatUserIds.add(otherUserId);
            // Store the latest message for each user
            if (!lastMessages[otherUserId] || message.createdAt > lastMessages[otherUserId].createdAt) {
                lastMessages[otherUserId] = message;
            }

            // ✅ Count unread messages received by current user from this other user
            if (message.receiver.toString() === userId && !message.isRead) {
                unreadCounts[otherUserId] = (unreadCounts[otherUserId] || 0) + 1;
            }
        }
    });

    // If no messages, return empty array
    if (chatUserIds.size === 0) {
        return [];
    }

    // Fetch user details for all unique user IDs
    const chatUsers = await Promise.all(
        Array.from(chatUserIds).map(async (otherUserId) => {
            // Try to find user in Accounts
            const user = await User.findById(otherUserId)
                .select("_id name profilePicture role")
                .lean();

            if (!user) return null;

            const lastMessage = lastMessages[otherUserId];

            return {
                _id: user._id,
                name: user?.name || "User",
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                lastMessage: lastMessage?.content || "No messages yet",
                lastMessageTime: lastMessage?.createdAt || null,
                messageType: lastMessage?.messageType || "text",
                // ✅ Only count unread messages from this user to current user
                unreadCount: unreadCounts[otherUserId] || 0,
                isRead: lastMessage?.isRead || false
            };
        })
    );

    // Filter out null values and sort by last message time
    const sortedChatUsers = chatUsers
        .filter(user => user !== null)
        .sort((a: any, b: any) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });

    return sortedChatUsers;
};

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
const getUnreadCount = async (userId: string) => {
    const count = await Message.countDocuments({
        receiver: userId,
        isRead: false
    });
    return count;
};

/* Mark Single Message as Read */
const markSingleMessageAsRead = async (userId: string, messageId: string) => {
    const message = await Message.findOne({
        _id: messageId,
        receiver: userId,
        isRead: false
    });

    if (!message) {
        throw new AppError(httpStatus.NOT_FOUND, "Message not found or already read");
    }

    message.isRead = true;
    await message.save();

    return {
        success: true,
        message: "Message marked as read",
        data: message,
    };
};

export const MessageServices = {
    getChatList,
    getMessages,
    getUnreadCount,
    markSingleMessageAsRead,
};