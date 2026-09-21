import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ChatServices } from "./chat.service";


//Ask a question to the Vedic knowledge base
const askQuestion = catchAsync(async (req, res) => {

  const result = await ChatServices.askQuestion(req.body, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Answer generated successfully",
    data: result,
  });
});

//Get all chats for the user
const getUserChats = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const {
    keyword,
    skip = "0",
    limit = "10",
  } = req.query;

  const filters = {
    keyword: keyword as string
  };

  const result = await ChatServices.getUserChats(userId, filters, Number(skip),
    Number(limit));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chats fetched successfully",
    data: result,
  });
});

//Get a single chat by ID
const getChatById = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;

  const chat = await ChatServices.getChatById(chatId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat fetched successfully",
    data: chat,
  });
});

//Update chat title
const updateChatTitle = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title || title.trim().length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Title is required",
      data: null,
    });
  }

  const chat = await ChatServices.updateChatTitle(chatId, userId, title.trim());

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat title updated successfully",
    data: chat,
  });
});

//Delete a chat
const deleteChat = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;

  await ChatServices.deleteChat(chatId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat deleted successfully",
    data: null,
  });
});

export const ChatControllers = {
  askQuestion,
  getUserChats,
  getChatById,
  updateChatTitle,
  deleteChat,
};