/* eslint-disable @typescript-eslint/no-explicit-any */
import { Conversation } from "./conversation.model";
import { Types } from "mongoose";
import { Message } from "./message/message.model";

const accessChat = async (userId: string, targetUserId: string) => {
    if (!targetUserId) throw new Error("Target User ID is required");

    // 1. Check if a 1-on-1 chat already exists between these two
    const isChat = await Conversation.find({
        isGroup: false,
        $and: [
            { members: { $elemMatch: { $eq: new Types.ObjectId(userId) } } },
            { members: { $elemMatch: { $eq: new Types.ObjectId(targetUserId) } } },
        ],
    })
        .populate("members", "name profilePicture")
        .populate("lastMessage");

    if (isChat.length > 0) {
        return isChat[0];
    } else {
        // 2. If not, create a new 1-on-1 chat
        const chatData = {
            isGroup: false,
            members: [new Types.ObjectId(userId), new Types.ObjectId(targetUserId)],
        };
        const createdChat = await Conversation.create(chatData);

        // Fetch it again to populate the members
        const fullChat = await Conversation.findById(createdChat._id)
            .populate("members", "name profilePicture")
            .populate("lastMessage");

        return fullChat;
    }
};

const getMyInbox = async (userId: string) => {
    const userObjectId = new Types.ObjectId(userId);

    const conversations = await Conversation.find({
        members: { $in: [userObjectId] },
    })
        .populate("members", "name profilePicture")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
        .lean();

    const formattedInbox = await Promise.all(
        conversations.map(async (convo: any) => {
            let chatName = convo.groupName;
            let chatAvatar = convo.groupAvatar;
            let otherUser = null;

            if (!convo.isGroup) {
                otherUser = convo.members.find(
                    (member: any) => member._id.toString() !== userId
                );
                chatName = otherUser?.name || "Unknown User";
                chatAvatar = otherUser?.profilePicture || "";
            }

            // ✅ Calculate unread count
            // Find messages in this conversation where the sender is NOT me, and I am NOT in readBy
            const unreadCount = await Message.countDocuments({
                conversationId: convo._id,
                sender: { $ne: userObjectId },
                readBy: { $ne: userObjectId },
            });

            // Change the isRead logic
            let isRead = true;
            if (convo.lastMessage) {
                const readByStrings = convo.lastMessage.readBy?.map((id: any) => id.toString()) || [];
                const senderString = convo.lastMessage.sender.toString();

                // If I am the sender, I need to check if the OTHER person (or ANYONE else in a group) has read it
                if (senderString === userId.toString()) {
                    if (convo.isGroup) {
                        // In a group, if at least one other person read it, or if everyone read it (depending on your rule)
                        // For simplicity, let's say if the readBy array is greater than 1 (meaning someone else read it)
                        isRead = readByStrings.length > 1;
                    } else {
                        // In 1-on-1, if the other user's ID is in readBy
                        const otherMemberId = convo.members.find((m: any) => m._id.toString() !== userId);
                        isRead = otherMemberId ? readByStrings.includes(otherMemberId._id.toString()) : false;
                    }
                } else {
                    // If I am the receiver, I only care if I read it
                    isRead = readByStrings.includes(userId.toString());
                }
            }

            return {
                conversationId: convo._id,
                isGroup: convo.isGroup,
                name: chatName,
                avatar: chatAvatar,
                otherUserId: otherUser?._id || null,
                lastMessage: convo.lastMessage
                    ? {
                        text: convo.lastMessage.text,
                        sender: convo.lastMessage.sender,
                        createdAt: convo.lastMessage.createdAt,
                        isRead: isRead,
                    }
                    : null,
                unreadCount: unreadCount,
                updatedAt: convo.updatedAt,
            };
        })
    );

    return formattedInbox;
};

export const ConversationServices = {
    accessChat,
    getMyInbox,
};