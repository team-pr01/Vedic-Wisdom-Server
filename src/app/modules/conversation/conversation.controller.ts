import httpStatus from "http-status";
import { ConversationServices } from "./conversation.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";


const accessChat = catchAsync(async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user.userId;

  const result = await ConversationServices.accessChat(userId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat accessed successfully",
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

export const ConversationControllers = {
  accessChat,
  getMyInbox,
};