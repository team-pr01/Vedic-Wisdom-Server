/* eslint-disable @typescript-eslint/no-explicit-any */
import { Chat } from "./chat.model";

/* Get Chat List (Inbox) */
const getChatList = async (userId: string) => {
    const chats = await Chat.find({
        participants: userId,
        isActive: true,
    })
        .populate("participants", "_id name email profilePicture role")
        .populate("lastMessage", "content createdAt messageType isRead")
        .sort({ lastMessageAt: -1 })
        .lean();

    const chatUsers = chats.map((chat) => {
        // Get the other participant
        const otherUser = chat.participants.find(
            (p: any) => p._id.toString() !== userId
        );

        if (!otherUser) return null;

        // Count unread messages for this chat
        const unreadCount = 0; // You can calculate this

        return {
            _id: otherUser._id,
            name: otherUser.name || "User",
            email: otherUser.email,
            profilePicture: otherUser.profilePicture,
            role: otherUser.role,
            lastMessage: chat.lastMessage?.content || "No messages yet",
            lastMessageTime: chat.lastMessageAt || null,
            messageType: chat.lastMessage?.messageType || "text",
            unreadCount: unreadCount,
            isRead: chat.lastMessage?.isRead || false,
        };
    });

    // Filter out nulls and sort
    return chatUsers
        .filter(user => user !== null)
        .sort((a: any, b: any) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
        });
};

const updateChatLastMessage = async (senderId: string, receiverId: string, messageId: string) => {
    const chat = await Chat.findOne({
        participants: { $all: [senderId, receiverId] }
    });

    if (chat) {
        chat.lastMessage = messageId;
        chat.lastMessageAt = new Date();
        await chat.save();
    }
};


export const ChatServices = {
    getChatList,
    updateChatLastMessage
};