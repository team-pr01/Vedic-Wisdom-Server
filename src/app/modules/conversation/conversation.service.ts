/* eslint-disable @typescript-eslint/no-explicit-any */
import { Conversation } from "./conversation.model";
import { Types } from "mongoose";
import { Message } from "./message/message.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { getIO, isUserOnline } from "../../socket";
import { User } from "../auth/auth.model";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";
import { infinitePaginate } from "../../utils/infinitePaginate";

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

    //  1. Removed the deletedBy filter from the query
    const conversations = await Conversation.find({
        members: { $in: [userObjectId] },
    })
        .populate("members", "name profilePicture lastActiveAt") 
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
        .lean();

    const formattedInbox = await Promise.all(
        conversations.map(async (convo: any) => {
            let chatName = convo.groupName;
            let chatAvatar = convo.groupAvatar;
            let otherUser = null;
            let isOnline = false;

            if (!convo.isGroup) {
                otherUser = convo.members.find(
                    (member: any) => member._id.toString() !== userId
                );
                chatName = otherUser?.name || "Unknown User";
                chatAvatar = otherUser?.profilePicture || "";
                
                if (otherUser?._id) {
                    isOnline = isUserOnline(otherUser._id.toString());
                }
            }

            //  2. Check if the user previously deleted this chat
            const deletionRecord = convo.deletedBy?.find(
                (d: any) => d.user && d.user.toString() === userId.toString()
            );

            let isHiddenByDelete = false;

            if (deletionRecord) {
                const lastMsgDate = convo.lastMessage?.createdAt ? new Date(convo.lastMessage.createdAt) : new Date(0);
                const deleteDate = new Date(deletionRecord.deletedAt);
                
                // If the last message is OLDER than the delete time, keep it hidden
                if (lastMsgDate < deleteDate) {
                    isHiddenByDelete = true;
                }
            }

            //  3. Skip this conversation entirely if it's still "deleted"
            if (isHiddenByDelete) {
                return null;
            }

            // Calculate unread count
            const unreadCount = await Message.countDocuments({
                conversationId: convo._id,
                sender: { $ne: userObjectId },
                readBy: { $ne: userObjectId },
            });

            // isRead logic
            let isRead = true;
            if (convo.lastMessage) {
                const readByStrings = convo.lastMessage.readBy?.map((id: any) => id.toString()) || [];
                const senderString = convo.lastMessage.sender.toString();

                // If I am the sender, check if everyone else has read it
                if (senderString === userId.toString()) {
                    if (convo.isGroup) {
                        // ✅ GROUP LOGIC: Check if ALL other members are in readBy
                        const otherMembers = convo.members.filter(
                            (m: any) => m._id.toString() !== userId
                        );
                        isRead = otherMembers.every((member: any) => 
                            readByStrings.includes(member._id.toString())
                        );
                    } else {
                        // 1-ON-1 LOGIC
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

            const groupMemberCount = convo.isGroup ? convo.members.length : 0;

            return {
                conversationId: convo._id,
                isGroup: convo.isGroup,
                name: chatName,
                messageRequestStatus: convo.messageRequestStatus,
                requestedBy: convo.requestedBy,
                avatar: chatAvatar,
                otherUserId: otherUser?._id || null,
                hasLeft: hasLeft || false,
                groupMemberCount,
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
                blockedBy: convo.blockedBy,
                isOnline: isOnline,
                lastActiveAt: otherUser?.lastActiveAt || null,
            };
        })
    );

    //  4. Filter out the null entries (the hidden deleted chats)
    return formattedInbox.filter((chat) => chat !== null);
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

const updateGroupInfo = async (
    conversationId: string,
    userId: string,
    payload: { groupName?: string },
    file?: Express.Multer.File
) => {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // Verify the user is a member of the group
    const isMember = conversation.members.some(
        (memberId) => memberId.toString() === userId.toString()
    );
    if (!isMember) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this group");
    }

    const updateData: any = {};
    const systemMessages: string[] = [];

    // 1. Handle Group Name Update
    if (payload.groupName && payload.groupName !== conversation.groupName) {
        updateData.groupName = payload.groupName;
        systemMessages.push(`Group name changed to "${payload.groupName}"`);
    }

    // 2. Handle Group Avatar Update
    if (file) {
        // Delete old avatar from Cloudinary if it exists
        if (conversation.groupAvatar) {
            const publicId = extractPublicId(conversation.groupAvatar);
            await deleteImageFromCloudinary(publicId);
        }

        // Upload new avatar
        const imageName = `group-avatar-${conversationId}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = await sendImageToCloudinary(imageName, path);

        updateData.groupAvatar = secure_url;
    }

    // If nothing changed, return early
    if (Object.keys(updateData).length === 0) {
        return conversation;
    }

    // 3. Update the Conversation
    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $set: updateData },
        { new: true }
    ).populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture email");

    // 4. Create System Messages for the updates
    const io = getIO();

    if (systemMessages.length > 0) {
        const systemMessageText = systemMessages.join(" and ");
        const systemMessage = await Message.create({
            conversationId,
            sender: userId,
            text: systemMessageText,
            isSystemMessage: true,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: systemMessage._id,
        });

        // Emit the system message
        io.to(conversationId).emit("receiveMessage", systemMessage);
    }

    // 5. Emit the updated conversation details to everyone in the room
    io.to(conversationId).emit("groupInfoUpdated", updatedConversation);

    return updatedConversation;
};

const getGroupMembers = async (conversationId: string, userId: string) => {
    const conversation = await Conversation.findById(conversationId)
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture email");

    if (!conversation) {
        throw new AppError(httpStatus.NOT_FOUND, "Group not found");
    }

    if (!conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "This is a 1-on-1 chat, not a group");
    }

    // Verify the requester is actually a member of this group
    const isMember = conversation.members.some(
        (member: any) => member._id.toString() === userId.toString()
    );
    if (!isMember) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this group");
    }

    // Extract admin IDs into a string array for easy comparison
    const adminIds = conversation.admins?.map((admin: any) => admin._id.toString()) || [];

    const adminMembers: any[] = [];
    const otherMembers: any[] = [];

    // Split members into Admins and Others, and add isMe flag
    conversation.members.forEach((member: any) => {
        //  Check if this member is the one requesting the data
        const isMe = member._id.toString() === userId.toString();

        // Create a new object with the isMe flag
        const memberData = {
            ...member.toObject ? member.toObject() : member,
            isMe,
        };

        if (adminIds.includes(member._id.toString())) {
            adminMembers.push(memberData);
        } else {
            otherMembers.push(memberData);
        }
    });

    return {
        groupName: conversation.groupName,
        groupAvatar: conversation.groupAvatar,
        totalMembers: conversation.members.length,
        admins: adminMembers,
        members: otherMembers,
    };
};

const addMembersToGroup = async (
    conversationId: string,
    adminId: string,
    newMemberIds: string[]
) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // 1. Verify the person adding members is actually in the group
    const isMember = conversation.members.some(
        (m) => m.toString() === adminId.toString()
    );
    if (!isMember) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this group");
    }

    // 2. Get names for the system message (e.g., "Rahul added Prerna and Amit")
    const adminUser = await User.findById(adminId).select("name");
    const newUsers = await User.find({ _id: { $in: newMemberIds } }).select("name");

    if (newUsers.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "Selected users not found");
    }

    const newUserIds = newUsers.map((u) => u._id);
    const newUserNames = newUsers.map((u) => u.name);

    // Format names: "Prerna", "Prerna and Amit", "Prerna, Amit and 2 others"
    let addedNamesString = "";
    if (newUserNames.length === 1) addedNamesString = newUserNames[0];
    else if (newUserNames.length === 2) addedNamesString = `${newUserNames[0]} and ${newUserNames[1]}`;
    else addedNamesString = `${newUserNames[0]}, ${newUserNames[1]} and ${newUserNames.length - 2} others`;

    // 3. Update the Conversation
    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            // $addToSet adds only if not already present
            $addToSet: { members: { $each: newUserIds } },
            // If they were previously in leftMembers, remove them so they can chat again
            $pull: { leftMembers: { $in: newUserIds } },
        },
        { new: true }
    ).populate("members", "name profilePicture email");

    // 4. Create System Message
    const systemMessage = await Message.create({
        conversationId,
        sender: adminId,
        text: `${adminUser?.name} added ${addedNamesString}`,
        isSystemMessage: true,
    });

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMessage._id,
    });

    // 5. Real-time Socket Events
    const io = getIO();

    // Emit the system message to everyone currently in the chat room
    io.to(conversationId).emit("receiveMessage", systemMessage);

    // Emit an event so the frontend updates the member list instantly
    io.to(conversationId).emit("groupMembersUpdated", updatedConversation);

    // Make the new members join the socket room so they receive future messages
    newUserIds.forEach((id) => {
        io.to(id.toString()).emit("joinNewGroup", conversationId);
    });

    return { success: true, message: "Members added successfully", data: updatedConversation };
};

const leaveGroup = async (conversationId: string, userId: string) => {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // ✅ 1. Remove user from members and admins, but add to leftMembers for history
    await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { 
            members: new Types.ObjectId(userId), 
            admins: new Types.ObjectId(userId) 
        },
        $push: { leftMembers: new Types.ObjectId(userId) }
    });

    // 2. Create system message
    const newSystemMessage = await Message.create({
        conversationId,
        sender: userId,
        text: "User left the group",
        isSystemMessage: true
    });

    // 3. Populate and update lastMessage
    const populatedMessage = await Message.findById(newSystemMessage._id)
        .populate("sender", "name profilePicture");

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: newSystemMessage._id,
    });

    const io = getIO();

    // 4. Emit the message to the room
    if (populatedMessage) {
        io.to(conversationId).emit("receiveMessage", populatedMessage);
    }

    // 5. Tell the leaving user's frontend to leave the socket room
    io.to(userId.toString()).emit("leaveSocketRoom", conversationId);

    // 6. ✅ Emit an event to update the member list for everyone else
    const updatedConversation = await Conversation.findById(conversationId);
    io.to(conversationId).emit("groupMembersUpdated", updatedConversation);

    return { success: true, message: "You left the group" };
};

const makeGroupAdmin = async (
    conversationId: string,
    requesterId: string,
    targetUserId: string
) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // Check if requester is an admin
    const isRequesterAdmin = conversation.admins?.some(
        (id) => id.toString() === requesterId.toString()
    );
    if (!isRequesterAdmin) {
        throw new AppError(httpStatus.FORBIDDEN, "Only group admins can promote members");
    }

    // Check if target is a member
    const isTargetMember = conversation.members.some(
        (id) => id.toString() === targetUserId.toString()
    );
    if (!isTargetMember) {
        throw new AppError(httpStatus.NOT_FOUND, "User is not a member of this group");
    }

    // Add to admins array if not already there
    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $addToSet: { admins: targetUserId } },
        { new: true }
    ).populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture email");

    const targetUser = await User.findById(targetUserId).select("name");

    // Create System Message
    const systemMessage = await Message.create({
        conversationId,
        sender: requesterId,
        text: `${targetUser?.name} was promoted to Admin`,
        isSystemMessage: true,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMessage._id,
    });

    // Real-time Socket Events
    const io = getIO();
    io.to(conversationId).emit("receiveMessage", systemMessage);
    io.to(conversationId).emit("groupMembersUpdated", updatedConversation);

    return updatedConversation;
};

const removeFromAdmin = async (
    conversationId: string,
    requesterId: string,
    targetUserId: string
) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // Check if requester is an admin
    const isRequesterAdmin = conversation.admins?.some(
        (id) => id.toString() === requesterId.toString()
    );
    if (!isRequesterAdmin) {
        throw new AppError(httpStatus.FORBIDDEN, "Only group admins can dismiss other admins");
    }

    // Prevent an admin from dismissing themselves
    if (requesterId.toString() === targetUserId.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, "You cannot dismiss yourself as admin");
    }

    // Check if target is actually an admin
    const isTargetAdmin = conversation.admins?.some(
        (id) => id.toString() === targetUserId.toString()
    );
    if (!isTargetAdmin) {
        throw new AppError(httpStatus.BAD_REQUEST, "This user is not an admin");
    }

    // Remove from admins array
    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        { $pull: { admins: targetUserId } },
        { new: true }
    )
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture email");

    const targetUser = await User.findById(targetUserId).select("name");

    // Create System Message
    const systemMessage = await Message.create({
        conversationId,
        sender: requesterId,
        text: `${targetUser?.name} was dismissed as Admin`,
        isSystemMessage: true,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMessage._id,
    });

    // Real-time Socket Events
    const io = getIO();
    io.to(conversationId).emit("receiveMessage", systemMessage);
    io.to(conversationId).emit("groupMembersUpdated", updatedConversation);

    return updatedConversation;
};

// Remove a member from the group
const removeFromGroup = async (
    conversationId: string,
    requesterId: string,
    targetUserId: string
) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Not a valid group");
    }

    // Check if requester is an admin
    const isRequesterAdmin = conversation.admins?.some(
        (id) => id.toString() === requesterId.toString()
    );
    if (!isRequesterAdmin) {
        throw new AppError(httpStatus.FORBIDDEN, "Only group admins can remove members");
    }

    // Prevent admin from removing themselves
    if (requesterId.toString() === targetUserId.toString()) {
        throw new AppError(httpStatus.BAD_REQUEST, "Use the 'Leave Group' feature to remove yourself");
    }

    // Remove from members and admins
    const updatedConversation = await Conversation.findByIdAndUpdate(
        conversationId,
        {
            $pull: {
                members: targetUserId,
                admins: targetUserId,
            },
        },
        { new: true }
    ).populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture email");

    if (!updatedConversation) {
        throw new AppError(httpStatus.NOT_FOUND, "User was not in the group");
    }

    const targetUser = await User.findById(targetUserId).select("name");

    // Create System Message
    const systemMessage = await Message.create({
        conversationId,
        sender: requesterId,
        text: `${targetUser?.name} was removed from the group`,
        isSystemMessage: true,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: systemMessage._id,
    });

    // Real-time Socket Events
    const io = getIO();
    io.to(conversationId).emit("receiveMessage", systemMessage);
    io.to(conversationId).emit("groupMembersUpdated", updatedConversation);

    // Force the removed user's socket to leave the room
    io.to(targetUserId.toString()).emit("leaveSocketRoom", conversationId);

    return updatedConversation;
};

const deleteChatForUser = async (conversationId: string, userId: string) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    // 1. Remove the user from deletedBy first (prevents duplicate bugs)
    await Conversation.findByIdAndUpdate(conversationId, {
        $pull: { deletedBy: { user: new Types.ObjectId(userId) } }
    });

    // 2. Add them back with the CURRENT timestamp
    await Conversation.findByIdAndUpdate(conversationId, {
        $push: { deletedBy: { user: new Types.ObjectId(userId), deletedAt: new Date() } }
    });

    // 3. Emit socket so the UI updates instantly
    const io = getIO();
    io.to(userId.toString()).emit("chatDeleted", { conversationId });

    return { success: true, message: "Chat deleted successfully" };
};

const toggleBlockUser = async (
    conversationId: string,
    requesterId: string,
    action: "block" | "unblock"
) => {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || conversation.isGroup) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid conversation");
    }

    //  Cast requesterId to ObjectId for Mongoose operators
    const requesterObjectId = new Types.ObjectId(requesterId);

    if (action === "block") {
        // Add to blockedBy if not already there
        await Conversation.findByIdAndUpdate(conversationId, {
            $addToSet: { blockedBy: requesterObjectId }, //  Use ObjectId
        });

        const io = getIO();
        io.to(conversationId).emit("blockStatusChanged", {
            conversationId,
            blockedBy: requesterId,
            action
        });

    } else {
        // Remove from blockedBy
        await Conversation.findByIdAndUpdate(conversationId, {
            $pull: { blockedBy: requesterObjectId }, //  Use ObjectId
        });

        const io = getIO();
        io.to(conversationId).emit("blockStatusChanged", {
            conversationId,
            blockedBy: requesterId,
            action
        });
    }

    const updatedConversation = await Conversation.findById(conversationId);
    return updatedConversation;
};

// 2. Get My Blocked Users List
const getMyBlockedUsers = async (
    userId: string,
    skip = 0,
    limit = 10
) => {
    const userObjectId = new Types.ObjectId(userId);

    // 1. Build the query
    const query = {
        isGroup: false,
        blockedBy: { $in: [userObjectId] },
    };

    // 2. Use infinitePaginate to get the paginated conversations
    const result = await infinitePaginate(
        Conversation,
        query,
        skip,
        limit,
        [{ path: "members", select: "name profilePicture email" }]
    );

    // 3. Format the paginated data to extract the blocked user
    const formattedBlockedUsers = result.data.map((convo: any) => {
        // Find the other user (the one who is blocked)
        const blockedUser = convo.members.find(
            (member: any) => member._id.toString() !== userId.toString()
        );

        return {
            conversationId: convo._id,
            userId: blockedUser?._id,
            name: blockedUser?.name || "Unknown",
            profilePicture: blockedUser?.profilePicture,
            email: blockedUser?.email,
        };
    });

    // 4. Return the formatted data with the meta data from infinitePaginate
    return {
        data: formattedBlockedUsers,
        meta: result.meta,
    };
};

export const ConversationServices = {
    accessChat,
    handleMessageRequest,
    getMyInbox,
    createGroupChat,
    updateGroupInfo,
    getGroupMembers,
    addMembersToGroup,
    leaveGroup,
    makeGroupAdmin,
    removeFromAdmin,
    removeFromGroup,
    deleteChatForUser,
    toggleBlockUser,
    getMyBlockedUsers
};