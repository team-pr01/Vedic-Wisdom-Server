/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { ConversationServices } from "./conversation.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getIO } from "../../socket";
import AppError from "../../errors/AppError";


const accessChat = catchAsync(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user.userId;

  const result = await ConversationServices.accessChat(userId, targetUserId);

  if (result?.messageRequestStatus === "pending" && result?.requestedBy?.toString() === userId) {
    const io = getIO();

    // 1. Notify the Receiver (so it pops up in their list)
    io.to(targetUserId).emit("newMessageRequest", result);

    // 2. Notify the Sender (so YOUR list updates instantly without refreshing)
    io.to(userId).emit("newMessageRequest", result);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat accessed successfully",
    data: result,
  });
});

const handleMessageRequest = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { action } = req.body;
  const userId = req.user.userId;

  const result = await ConversationServices.handleMessageRequest(conversationId, userId, action);

  if (action === "accepted") {
    const io = getIO();

    // We emit a special event that tells the frontend to join the room
    io.to(userId.toString()).emit("requestAcceptedJoinRoom", conversationId);

    // Also tell the other user (the sender) to join the room
    const otherUser = result.members.find((m: any) => m.toString() !== userId);
    if (otherUser) {
      io.to(otherUser.toString()).emit("requestAcceptedJoinRoom", conversationId);
    }
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Message request ${action}`,
    data: result,
  });
});


const getMyInbox = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await ConversationServices.getMyInbox(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Inbox fetched successfully",
    data: result,
  });
});

const createGroupChat = catchAsync(async (req, res) => {
  const file = req.file;
  const userId = req.user.userId;
  const { groupName, groupAvatar, members } = req.body;

  const result = await ConversationServices.createGroupChat(userId, {
    groupName,
    groupAvatar,
    members,
  }, file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Group chat created successfully",
    data: result,
  });
});

const updateGroupInfo = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;
  const file = req.file;

  const result = await ConversationServices.updateGroupInfo(
    conversationId,
    userId,
    req.body,
    file
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group info updated successfully",
    data: result,
  });
});

const getGroupMembers = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  const result = await ConversationServices.getGroupMembers(conversationId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group members fetched successfully",
    data: result,
  });
});

const addGroupMembers = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { members } = req.body;
  const userId = req.user.userId;

  if (!members || !Array.isArray(members) || members.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please select at least one member");
  }

  const result = await ConversationServices.addMembersToGroup(
    conversationId,
    userId,
    members
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Members added successfully",
    data: result.data,
  });
});

// Delete Chat (1-on-1 or Group)
const deleteChatForUser = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  const result = await ConversationServices.deleteChatForUser(
    conversationId,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat deleted successfully",
    data: result,
  });
});

// Leave Group
const leaveGroup = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  const result = await ConversationServices.leaveGroup(
    conversationId,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "You have left the group successfully",
    data: result,
  });
});

const makeGroupAdmin = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { targetUserId } = req.body;
  const requesterId = req.user.userId;

  const result = await ConversationServices.makeGroupAdmin(conversationId, requesterId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Member promoted to admin",
    data: result,
  });
});

const removeFromAdmin = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { targetUserId } = req.body;
  const requesterId = req.user.userId;

  const result = await ConversationServices.removeFromAdmin(
    conversationId,
    requesterId,
    targetUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Admin dismissed successfully",
    data: result,
  });
});

const removeFromGroup = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { targetUserId } = req.body;
  const requesterId = req.user.userId;

  const result = await ConversationServices.removeFromGroup(conversationId, requesterId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Member removed from group",
    data: result,
  });
});


export const ConversationControllers = {
  accessChat,
  handleMessageRequest,
  getMyInbox,
  createGroupChat,
  updateGroupInfo,
  getGroupMembers,
  addGroupMembers,
  deleteChatForUser,
  leaveGroup,
  makeGroupAdmin,
  removeFromAdmin,
  removeFromGroup
};