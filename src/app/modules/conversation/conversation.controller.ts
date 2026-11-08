/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { ConversationServices } from "./conversation.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { getIO } from "../../socket";


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
  const userId = req.user.userId;
  const { groupName, groupAvatar, members } = req.body;

  const result = await ConversationServices.createGroupChat(userId, {
    groupName,
    groupAvatar,
    members,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Group chat created successfully",
    data: result,
  });
});

export const ConversationControllers = {
  accessChat,
  handleMessageRequest,
  getMyInbox,
  createGroupChat
};