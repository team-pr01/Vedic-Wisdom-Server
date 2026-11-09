"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const conversation_model_1 = require("./conversation.model");
const mongoose_1 = require("mongoose");
const message_model_1 = require("./message/message.model");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const accessChat = (userId, targetUserId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!targetUserId)
        throw new Error("Target User ID is required");
    // 1. Check if a 1-on-1 chat already exists between these two
    const isChat = yield conversation_model_1.Conversation.find({
        isGroup: false,
        $and: [
            { members: { $elemMatch: { $eq: new mongoose_1.Types.ObjectId(userId) } } },
            { members: { $elemMatch: { $eq: new mongoose_1.Types.ObjectId(targetUserId) } } },
        ],
    })
        .populate("members", "name profilePicture")
        .populate("lastMessage");
    if (isChat.length > 0) {
        return isChat[0];
    }
    else {
        // 2. If not, create a new 1-on-1 chat
        const chatData = {
            isGroup: false,
            members: [new mongoose_1.Types.ObjectId(userId), new mongoose_1.Types.ObjectId(targetUserId)],
            messageRequestStatus: "pending",
            requestedBy: new mongoose_1.Types.ObjectId(userId),
        };
        const createdChat = yield conversation_model_1.Conversation.create(chatData);
        // Fetch it again to populate the members
        const fullChat = yield conversation_model_1.Conversation.findById(createdChat._id)
            .populate("members", "name profilePicture")
            .populate("lastMessage");
        return fullChat;
    }
});
const handleMessageRequest = (conversationId, userId, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Conversation not found");
    // Ensure the person accepting/rejecting is the RECEIVER, not the sender
    if (((_a = conversation.requestedBy) === null || _a === void 0 ? void 0 : _a.toString()) === userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You cannot accept your own request");
    }
    conversation.messageRequestStatus = action;
    yield conversation.save();
    return conversation;
});
const getMyInbox = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const userObjectId = new mongoose_1.Types.ObjectId(userId);
    const conversations = yield conversation_model_1.Conversation.find({
        members: { $in: [userObjectId] },
        "deletedBy.user": { $ne: userObjectId }
    })
        .populate("members", "name profilePicture")
        .populate("lastMessage")
        .sort({ updatedAt: -1 })
        .lean();
    const formattedInbox = yield Promise.all(conversations.map((convo) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        let chatName = convo.groupName;
        let chatAvatar = convo.groupAvatar;
        let otherUser = null;
        if (!convo.isGroup) {
            otherUser = convo.members.find((member) => member._id.toString() !== userId);
            chatName = (otherUser === null || otherUser === void 0 ? void 0 : otherUser.name) || "Unknown User";
            chatAvatar = (otherUser === null || otherUser === void 0 ? void 0 : otherUser.profilePicture) || "";
        }
        // Calculate unread count
        // Find messages in this conversation where the sender is NOT me, and I am NOT in readBy
        const unreadCount = yield message_model_1.Message.countDocuments({
            conversationId: convo._id,
            sender: { $ne: userObjectId },
            readBy: { $ne: userObjectId },
        });
        // Change the isRead logic
        let isRead = true;
        if (convo.lastMessage) {
            const readByStrings = ((_a = convo.lastMessage.readBy) === null || _a === void 0 ? void 0 : _a.map((id) => id.toString())) || [];
            const senderString = convo.lastMessage.sender.toString();
            // If I am the sender, I need to check if the OTHER person (or ANYONE else in a group) has read it
            if (senderString === userId.toString()) {
                if (convo.isGroup) {
                    // In a group, if at least one other person read it, or if everyone read it (depending on your rule)
                    // For simplicity, let's say if the readBy array is greater than 1 (meaning someone else read it)
                    isRead = readByStrings.length > 1;
                }
                else {
                    // In 1-on-1, if the other user's ID is in readBy
                    const otherMemberId = convo.members.find((m) => m._id.toString() !== userId);
                    isRead = otherMemberId ? readByStrings.includes(otherMemberId._id.toString()) : false;
                }
            }
            else {
                // If I am the receiver, I only care if I read it
                isRead = readByStrings.includes(userId.toString());
            }
        }
        return {
            conversationId: convo._id,
            isGroup: convo.isGroup,
            name: chatName,
            messageRequestStatus: convo.messageRequestStatus,
            requestedBy: convo.requestedBy,
            avatar: chatAvatar,
            otherUserId: (otherUser === null || otherUser === void 0 ? void 0 : otherUser._id) || null,
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
    })));
    return formattedInbox;
});
const createGroupChat = (creatorId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!payload.members || payload.members.length < 2) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "At least 2 members are required to create a group");
    }
    // Combine creator with the members list and remove duplicates
    const allMembers = [...new Set([creatorId, ...payload.members])];
    // Validation: Ensure creator is connected to all members (has a 1-on-1 chat)
    for (const memberId of payload.members) {
        const existingChat = yield conversation_model_1.Conversation.findOne({
            isGroup: false,
            $and: [
                { members: { $elemMatch: { $eq: new mongoose_1.Types.ObjectId(creatorId) } } },
                { members: { $elemMatch: { $eq: new mongoose_1.Types.ObjectId(memberId) } } },
            ],
        });
        if (!existingChat) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can only add users you have previously chatted with.");
        }
    }
    let imageUrl = "";
    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const groupChat = yield conversation_model_1.Conversation.create({
        isGroup: true,
        groupName: payload.groupName,
        groupAvatar: imageUrl || "",
        members: allMembers,
        admins: [creatorId], // Creator is the admin
    });
    const fullGroupChat = yield conversation_model_1.Conversation.findById(groupChat._id)
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture");
    return fullGroupChat;
});
const leaveGroup = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation || !conversation.isGroup) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Not a valid group");
    }
    // 1. Add user to leftMembers array
    yield conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $push: { leftMembers: userId }
    });
    // 2. Optional: Remove them from admins if they were one
    yield conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $pull: { admins: userId }
    });
    // 3. Optional: System message
    yield message_model_1.Message.create({
        conversationId,
        sender: userId,
        text: "User left the group",
        isSystemMessage: true // You might need to add this to your message model
    });
    return { success: true, message: "You left the group" };
});
const deleteChatForUser = (conversationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const conversation = yield conversation_model_1.Conversation.findById(conversationId);
    if (!conversation)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Chat not found");
    // Add the user to the deletedBy array
    yield conversation_model_1.Conversation.findByIdAndUpdate(conversationId, {
        $push: { deletedBy: { user: userId, deletedAt: new Date() } }
    });
    return { success: true, message: "Chat deleted successfully" };
});
exports.ConversationServices = {
    accessChat,
    handleMessageRequest,
    getMyInbox,
    createGroupChat,
    leaveGroup,
    deleteChatForUser,
};
