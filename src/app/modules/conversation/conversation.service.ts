/* eslint-disable @typescript-eslint/no-explicit-any */
import { Conversation } from "./conversation.model";
import { Types } from "mongoose";
import { Message } from "./message/message.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { getIO } from "../../socket";

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
            messageRequestStatus: "pending",
            requestedBy: new Types.ObjectId(userId),
        };
        const createdChat = await Conversation.create(chatData);

        // Fetch it again to populate the members
        const fullChat = await Conversation.findById(createdChat._id)
            .populate("members", "name profilePicture")
            .populate("lastMessage");

        return fullChat;
    }
};

const handleMessageRequest = async (
    conversationId: string,
    userId: string,
    action: "accepted" | "rejected"
) => {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");

    // Ensure the person accepting/rejecting is the RECEIVER, not the sender
    if (conversation.requestedBy?.toString() === userId) {
        throw new AppError(httpStatus.FORBIDDEN, "You cannot accept your own request");
    }

    conversation.messageRequestStatus = action;
    await conversation.save();

    return conversation;
};

const getMyInbox = async (userId: string) => {
    const userObjectId = new Types.ObjectId(userId);

    const conversations = await Conversation.find({
        members: { $in: [userObjectId] },
        "deletedBy.user": { $ne: userObjectId }
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

            // Calculate unread count
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

            const hasLeft = convo.isGroup && convo.leftMembers?.some(
                (id: any) => id && id.toString() === userId.toString()
            );


            return {
                conversationId: convo._id,
                isGroup: convo.isGroup,
                name: chatName,
                messageRequestStatus: convo.messageRequestStatus,
                requestedBy: convo.requestedBy,
                avatar: chatAvatar,
                otherUserId: otherUser?._id || null,
                hasLeft: hasLeft || false,
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

const createGroupChat = async (
    creatorId: string,
    payload: { groupName: string; groupAvatar?: string; members: string[] },
    file: Express.Multer.File | undefined
) => {
    if (!payload.members || payload.members.length < 2) {
        throw new AppError(httpStatus.BAD_REQUEST, "At least 2 members are required to create a group");
    }

    // Combine creator with the members list and remove duplicates
    const allMembers = [...new Set([creatorId, ...payload.members])];

    // Validation: Ensure creator is connected to all members (has a 1-on-1 chat)
    for (const memberId of payload.members) {
        const existingChat = await Conversation.findOne({
            isGroup: false,
            $and: [
                { members: { $elemMatch: { $eq: new Types.ObjectId(creatorId) } } },
                { members: { $elemMatch: { $eq: new Types.ObjectId(memberId) } } },
            ],
        });

        if (!existingChat) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You can only add users you have previously chatted with."
            );
        }
    }


    let imageUrl = "";

    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;

        const { secure_url } = await sendImageToCloudinary(imageName, path);
        imageUrl = secure_url;
    }

    const groupChat = await Conversation.create({
        isGroup: true,
        groupName: payload.groupName,
        groupAvatar: imageUrl || "",
        members: allMembers,
        admins: [creatorId], // Creator is the admin
    });

    const fullGroupChat = await Conversation.findById(groupChat._id)
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture");

    return fullGroupChat;
};

const leaveGroup = async (conversationId: string, userId: string) => {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // Update DB (Only needs to be done once)
    await Conversation.findByIdAndUpdate(conversationId, {
        $push: { leftMembers: userId },
        $pull: { admins: userId }
    });

    // Create system message (Only needs to be done once)
    const systemMessage = await Message.create({
        conversationId,
        sender: userId,
        text: "User left the group",
        isSystemMessage: true 
    });

    const io = getIO();

    // Emit system message to the room
    io.to(conversationId).emit("receiveMessage", systemMessage);

    // Tell the leaving user's frontend to leave the socket room
    io.to(userId.toString()).emit("leaveSocketRoom", conversationId);

    return { success: true, message: "You left the group" };
};

const deleteChatForUser = async (conversationId: string, userId: string) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError(httpStatus.NOT_FOUND, "Chat not found");

    // Add the user to the deletedBy array
    await Conversation.findByIdAndUpdate(conversationId, {
        $push: { deletedBy: { user: userId, deletedAt: new Date() } }
    });

    const io = getIO();
    io.to(userId.toString()).emit("chatDeleted", { conversationId });

    return { success: true, message: "Chat deleted successfully" };
};

export const ConversationServices = {
    accessChat,
    handleMessageRequest,
    getMyInbox,
    createGroupChat,
    leaveGroup,
    deleteChatForUser,
};