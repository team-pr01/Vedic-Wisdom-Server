import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { MessageServices } from "./message.service";

const getMessages = catchAsync(async (req, res) => {
  const { conversationId } = req.params;
  const { skip = "0", limit = "20" } = req.query;
  const userId = req.user.userId;

  const result = await MessageServices.getMessages(
    conversationId,
    userId,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages fetched successfully",
    data: result,
  });
});

const reactToMessage = catchAsync(async (req, res) => {
  const { messageId } = req.params;
  const { emoji, method } = req.body;
  const userId = req.user.userId;

  const result = await MessageServices.reactToMessage(
    messageId,
    userId,
    emoji,
    method || "add"
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Reaction ${method === "remove" ? "removed" : "added"} successfully`,
    data: result,
  });
});

export const MessageControllers = {
  getMessages,
  reactToMessage,
};