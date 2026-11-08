/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Message } from "./message.model";
import AppError from "../../../errors/AppError";
import { Types } from "mongoose";
import { Conversation } from "../conversation.model";

const getMessages = async (
  conversationId: string,
  userId: string,
  skip = 0,
  limit = 20
) => {
  // 1. Verify the user is part of this conversation and populate details
  const conversation = await Conversation.findById(conversationId)
    .populate("members", "name profilePicture email")
    .populate("admins", "name profilePicture");

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  const isMember = conversation.members.some(
    (member: any) => member._id.toString() === userId
  );

  if (!isMember) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this chat");
  }

  // 2. Fetch messages
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name profilePicture")
    .lean();

  const total = await Message.countDocuments({ conversationId });

  // 3. Mark these messages as read by the current user
  const messageIds = messages
    .filter((msg) => (msg.sender as any)?._id?.toString() !== userId && msg.sender?.toString() !== userId)
    .map((msg) => msg._id);

  if (messageIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } }
    );
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
};

export const MessageServices = {
  getMessages,
};