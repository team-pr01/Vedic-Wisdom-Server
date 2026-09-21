/* eslint-disable @typescript-eslint/no-explicit-any */
import Message from "../message/message.model";
import Chat from "./chat.model";

/* Get Chat List (Inbox) */
const getChatList = async (userId: string) => {
    const chats = await Chat.find({
        participants: userId,
        isActive: true,
    })
        .populate("participants", "_id name email profilePicture role")
        .populate("lastMessage", "content createdAt messageType isRead status")
        .sort({ lastMessageAt: -1 })
        .lean();

    const chatUsers = await Promise.all(
        chats.map(async (chat) => {
            // Get the other participant
            const otherUser: any = chat.participants.find(
                (p: any) => (p as any)._id?.toString() !== userId
            );

            if (!otherUser) return null;

            // ✅ Count unread messages from the other user to current user
            const unreadCount = await Message.countDocuments({
                sender: otherUser._id,
                receiver: userId,
                isRead: false,
            });

            const lastMessageData: any = chat.lastMessage;

            return {
                _id: otherUser._id,
                name: otherUser.name || "User",
                email: otherUser.email,
                profilePicture: otherUser.profilePicture,
                role: otherUser.role,
                lastMessage: lastMessageData?.content || "No messages yet",
                lastMessageTime: chat.lastMessageAt || null,
                messageType: lastMessageData?.messageType || "text",
                unreadCount: unreadCount,
                isRead: lastMessageData?.isRead || false,
                status: lastMessageData?.status || "sent",
            };
        })
    );

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
        chat.lastMessage = messageId as any;
        chat.lastMessageAt = new Date();
        await chat.save();
    }
};

export const ChatServices = {
    getChatList,
    updateChatLastMessage
};