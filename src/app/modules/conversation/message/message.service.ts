/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Message } from "./message.model";
import AppError from "../../../errors/AppError";
import { Types } from "mongoose";
import { Conversation } from "../conversation.model";
import { getIO } from "../../../socket";
import { User } from "../../auth/auth.model";

const getMessages = async (
  conversationId: string,
  userId: string,
  skip = 0,
  limit = 20
) => {
  const conversation = await Conversation.findById(conversationId)
    .populate("members", "name profilePicture email")
    .populate("admins", "name profilePicture");

  if (!conversation) {
    throw new AppError(httpStatus.NOT_FOUND, "Conversation not found");
  }

  const userIdString = userId.toString();

  // ✅ FIX 1: Safe check for leftMembers
  // const hasLeftGroup = conversation.isGroup && conversation.leftMembers?.some(
  //   (id: any) => id && id.toString() === userIdString // <-- Added 'id &&' check
  // );

  // if (hasLeftGroup) {
  //   throw new AppError(httpStatus.FORBIDDEN, "You have left this group and cannot view messages.");
  // }

  // ✅ FIX 2: Safe check for isMember
  const isMember = conversation.members.some(
    (member: any) => {
      if (!member) return false; // <-- Added null check
      const memberId = member._id || member;
      return memberId.toString() === userIdString;
    }
  );

  if (!isMember) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not a member of this chat");
  }

  // ✅ FIX 3: Safe check for deletedBy
  const deletionRecord = conversation?.deletedBy?.find(
    (d: any) => d && d.user && d.user.toString() === userIdString // <-- Added d && d.user check
  );

  const query: any = { conversationId };
  if (deletionRecord) {
    query.createdAt = { $gt: deletionRecord.deletedAt };
  }

  const messages = await Message.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("sender", "name profilePicture")
    .lean();

  const total = await Message.countDocuments(query);

  // ✅ FIX 4: Safe check for message sender
  const messageIds = messages
    .filter((msg) => {
      if (!msg.sender) return false; // <-- Added null check
      const senderId = (msg.sender as any)?._id?.toString() || msg.sender?.toString();
      return senderId !== userIdString;
    })
    .map((msg) => msg._id);

  if (messageIds.length > 0) {
    await Message.updateMany(
      { _id: { $in: messageIds } },
      { $addToSet: { readBy: new Types.ObjectId(userId) } }
    );
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
};

const reactToMessage = async (
  messageId: string,
  userId: string,
  emoji: string,
  method: "add" | "remove" = "add"
) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError(httpStatus.NOT_FOUND, "Message not found");

  const user = await User.findById(userId);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

  if (!message.reactions) {
    message.reactions = [];
  }

  const currentUserId = userId.toString();

  // Find if the user has ALREADY reacted with THIS EXACT emoji
  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === currentUserId && r.emoji === emoji
  );

  if (method === "remove") {
    // If they clicked the same emoji again, remove it
    if (existingReactionIndex > -1) {
      message.reactions.splice(existingReactionIndex, 1);
    }
  } else {
    // ✅ FIX: Remove ANY previous reaction from this user first
    // This ensures they can only have ONE reaction per message
    message.reactions = message.reactions.filter(
      (r) => r.userId.toString() !== currentUserId
    );

    // ✅ Now add the new reaction
    message.reactions.push({
      emoji,
      userId: new Types.ObjectId(userId) as any,
      userName: user.name,
    });
  }

  await message.save();

  // Emit real-time event to the room
  const io = getIO();
  io.to(message.conversationId.toString()).emit("messageReactionUpdated", {
    messageId: message._id,
    reactions: message.reactions,
  });

  return message;
};

export const MessageServices = {
  getMessages,
  reactToMessage,
};