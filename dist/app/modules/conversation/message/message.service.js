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
const getMessages = (conversationId_1, userId_1, ...args_1) => __awaiter(void 0, [conversationId_1, userId_1, ...args_1], void 0, function* (conversationId, userId, skip = 0, limit = 20) {
    var _a, _b;
    // 1. Verify the user is part of this conversation and populate details
    const conversation = yield conversation_model_1.Conversation.findById(conversationId)
        .populate("members", "name profilePicture email")
        .populate("admins", "name profilePicture");
    if (!conversation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Conversation not found");
    }
    // Find if the user deleted this chat previously
    const deletionRecord = (_a = conversation === null || conversation === void 0 ? void 0 : conversation.deletedBy) === null || _a === void 0 ? void 0 : _a.find((d) => d.user.toString() === userId);
    //✅ Only fetch messages sent AFTER the user deleted the chat
    const query = { conversationId };
    if (deletionRecord) {
        query.createdAt = { $gt: deletionRecord.deletedAt };
    }
    if (conversation.isGroup && ((_b = conversation === null || conversation === void 0 ? void 0 : conversation.leftMembers) === null || _b === void 0 ? void 0 : _b.includes(new mongoose_1.Types.ObjectId(userId)))) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You have left this group and cannot view or send messages.");
    }
    const isMember = conversation.members.some((member) => member._id.toString() === userId);
    if (!isMember) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not a member of this chat");
    }
    // 2. Fetch messages
    const messages = yield message_model_1.Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name profilePicture")
        .lean();
    const total = yield message_model_1.Message.countDocuments({ conversationId });
    // 3. Mark these messages as read by the current user
    const messageIds = messages
        .filter((msg) => { var _a, _b, _c; return ((_b = (_a = msg.sender) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) !== userId && ((_c = msg.sender) === null || _c === void 0 ? void 0 : _c.toString()) !== userId; })
        .map((msg) => msg._id);
    if (messageIds.length > 0) {
        yield message_model_1.Message.updateMany({ _id: { $in: messageIds } }, { $addToSet: { readBy: new mongoose_1.Types.ObjectId(userId) } });
    }
    return {
        messages: messages.reverse(),
        // ✅ Added conversation details here
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
exports.MessageServices = {
    getMessages,
};
