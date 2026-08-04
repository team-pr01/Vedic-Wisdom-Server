import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ChatServices } from "./chat.service";
import { IGetChatsQuery } from "./chat.interface";

//Create a new chat
const createChat = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { title, initialMessage } = req.body;

  const chat = await ChatServices.createChat(userId, {
    title: title || "New Chat",
    initialMessage,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Chat created successfully",
    data: chat,
  });
});

//Get all chats for the user
const getUserChats = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { page, limit, search, category, sortBy } = req.query;

  const query: IGetChatsQuery = {
    page: page ? parseInt(page as string) : 1,
    limit: limit ? parseInt(limit as string) : 20,
    search: search as string || "",
    category: category as string || "",
    sortBy: (sortBy as "newest" | "oldest" | "most_messages") || "newest",
  };

  const result = await ChatServices.getUserChats(userId, query);

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

//Delete all chats
const deleteAllChats = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const count = await ChatServices.deleteAllChats(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `${count} chats deleted successfully`,
    data: { deletedCount: count },
  });
});

//Send a message in a chat
const sendMessage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const { message, language, category } = req.body;

  if (!message || message.trim().length === 0) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Message cannot be empty",
      data: null,
    });
  }

  const result = await ChatServices.sendMessage(
    chatId,
    userId,
    message.trim(),
    { language, category }
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

//Regenerate the last assistant message
const regenerateLastMessage = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { chatId } = req.params;

  const result = await ChatServices.regenerateLastMessage(chatId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message regenerated successfully",
    data: result,
  });
});

export const ChatControllers = {
  createChat,
  getUserChats,
  getChatById,
  updateChatTitle,
  deleteChat,
  deleteAllChats,
  sendMessage,
  regenerateLastMessage,
};