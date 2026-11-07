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
  // 1. Verify the user is part of this conversation
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  const isMember = conversation.members.some(
    (memberId) => memberId.toString() === userId
  );
  if (!isMember) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this chat");
  }

  // 2. Fetch messages (Sort by descending to get the latest 20, then we can reverse on frontend if needed)
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await Message.countDocuments({ conversationId });

  // 3. Mark these messages as read by the current user
  // We only want to mark messages where the sender is NOT the current user
  const messageIds = messages
    .filter((msg) => msg.sender.toString() !== userId)
    .map((msg) => msg._id);

  if (messageIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } }
    );
  }

  // Note: Your 2-minute auto-delete logic should ideally happen in a DB hook 
  // or when you detect that all members have read the message.

  return {
    messages: messages.reverse(), // Reverse so oldest is at the top for the UI
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