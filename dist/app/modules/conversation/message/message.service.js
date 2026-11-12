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
exports.MessageServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const message_model_1 = require("./message.model");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const mongoose_1 = require("mongoose");
const conversation_model_1 = require("../conversation.model");
const socket_1 = require("../../../socket");
const auth_model_1 = require("../../auth/auth.model");
const getMessages = (conversationId_1, userId_1, ...args_1) => __awaiter(void 0, [conversationId_1, userId_1, ...args_1], void 0, function* (conversationId, userId, skip = 0, limit = 20) {
    var _a;
    const conversation = yield conversation_model_1.Conversation.findById(conversationId)
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture");
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Conversation not found");
    }
    const userIdString = userId.toString();
    // FIX 1: Safe check for leftMembers
    // const hasLeftGroup = conversation.isGroup && conversation.leftMembers?.some(
    //   (id: any) => id && id.toString() === userIdString // <-- Added 'id &&' check
    // );
    // if (hasLeftGroup) {
    //   throw new AppError(httpStatus.FORBIDDEN, "You have left this group and cannot view messages.");
    // }
    // FIX 2: Safe check for isMember
    const isMember = conversation.members.some((member) => {
        if (!member)
            return false; // <-- Added null check
        const memberId = member._id || member;
        return memberId.toString() === userIdString;
    });
    if (!isMember) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not a member of this chat");
    }
    // FIX 3: Safe check for deletedBy
    const deletionRecord = (_a = conversation === null || conversation === void 0 ? void 0 : conversation.deletedBy) === null || _a === void 0 ? void 0 : _a.find((d) => d && d.user && d.user.toString() === userIdString // <-- Added d && d.user check
    );
    const query = {
        conversationId,
        deletedFor: { $ne: new mongoose_1.Types.ObjectId(userId) }
    };
    // If the user deleted the whole chat previously, only show messages after that time
    if (deletionRecord) {
        const deletedAt = deletionRecord.deletedAt;
        if (deletedAt) {
            const cutoffTime = new Date(deletedAt.getTime() - 1000);
            query.createdAt = { $gt: cutoffTime };
        }
    }
    const messages = yield message_model_1.Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name profilePicture")
        .lean();
    const total = yield message_model_1.Message.countDocuments(query);
    // FIX 4: Safe check for message sender
    const messageIds = messages
        .filter((msg) => {
        var _a, _b, _c;
        if (!msg.sender)
            return false; // <-- Added null check
        const senderId = ((_b = (_a = msg.sender) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || ((_c = msg.sender) === null || _c === void 0 ? void 0 : _c.toString());
        return senderId !== userIdString;
    })
        .map((msg) => msg._id);
    if (messageIds.length > 0) {
        yield message_model_1.Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: new mongoose_1.Types.ObjectId(userId) } });
    }
    return {
        messages: messages.reverse(),
        conversationDetails: {
            isGroup: conversation.isGroup,
            groupName: conversation.groupName,
            groupAvatar: conversation.groupAvatar,
            members: conversation.members,
            admins: conversation.admins,
            blockedBy: conversation.blockedBy,
        },
        meta: {
            total,
            skip,
            limit,
            hasMore: skip + messages.length < total,
        },
    };
});
const reactToMessage = (messageId_1, userId_1, emoji_1, ...args_1) => __awaiter(void 0, [messageId_1, userId_1, emoji_1, ...args_1], void 0, function* (messageId, userId, emoji, method = "add") {
    const message = yield message_model_1.Message.findById(messageId);
    if (!message)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Message not found");
    const user = yield auth_model_1.User.findById(userId);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    if (!message.reactions) {
        message.reactions = [];
    }
    const currentUserId = userId.toString();
    // Find if the user has ALREADY reacted with THIS EXACT emoji
    const existingReactionIndex = message.reactions.findIndex((r) => r.userId.toString() === currentUserId && r.emoji === emoji);
    if (method === "remove") {
        // If they clicked the same emoji again, remove it
        if (existingReactionIndex > -1) {
            message.reactions.splice(existingReactionIndex, 1);
        }
    }
    else {
        // FIX: Remove ANY previous reaction from this user first
        // This ensures they can only have ONE reaction per message
        message.reactions = message.reactions.filter((r) => r.userId.toString() !== currentUserId);
        // Now add the new reaction
        message.reactions.push({
            emoji,
            userId: new mongoose_1.Types.ObjectId(userId),
            userName: user.name,
        });
    }
    yield message.save();
    // Emit real-time event to the room
    const io = (0, socket_1.getIO)();
    io.to(message.conversationId.toString()).emit("messageReactionUpdated", {
        messageId: message._id,
        reactions: message.reactions,
    });
    return message;
});
const deleteMessageForMe = (messageId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield message_model_1.Message.findById(messageId);
    if (!message) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Message not found");
    }
    // 1. Add user to deletedFor array in DB
    yield message_model_1.Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedFor: new mongoose_1.Types.ObjectId(userId) }
    });
    // 2. Emit a socket event ONLY to the user who deleted it
    const io = (0, socket_1.getIO)();
    io.to(userId.toString()).emit("messageDeletedForMe", { messageId });
    return { success: true };
});
const deleteMessageForEveryone = (messageId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const message = yield message_model_1.Message.findById(messageId);
    if (!message)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Message not found");
    // Authorization: Only sender or admin can unsend
    const isSender = message.sender.toString() === userId.toString();
    const isAdmin = userRole === "admin" || userRole === "moderator";
    if (!isSender && !isAdmin) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You can only unsend your own messages");
    }
    // Update DB to mark it unsent (We don't physically delete it so the frontend can render "Message deleted")
    const updatedMessage = yield message_model_1.Message.findByIdAndUpdate(messageId, {
        $set: {
            text: "This message was deleted",
            isDeletedForEveryone: true,
            // Optional: clear reactions, attachments, etc.
        },
    }, { new: true });
    // Emit Socket Event to everyone in the room
    const io = (0, socket_1.getIO)();
    io.to(message.conversationId.toString()).emit("messageDeletedForEveryone", updatedMessage);
    return updatedMessage;
});
exports.MessageServices = {
    getMessages,
    reactToMessage,
    deleteMessageForMe,
    deleteMessageForEveryone
};
