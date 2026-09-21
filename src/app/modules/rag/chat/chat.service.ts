/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../../errors/AppError";
import { AIChat } from "./chat.model";
import { IChat } from "./chat.interface";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import config from "../../../config";
import axios from "axios";

type TRAGQuery = {
  question: string;
  chatId?: string;
}

const askQuestion = async (payload: TRAGQuery, userId: string) => {
  const ragHost = config.rag_host;
  const ragApiKey = config.rag_api_key;

  try {

    let chat;
    let previousQuery: string | undefined;
    let previousAnswer: string | undefined;

    if (payload.chatId) {
      // ── Continue existing chat ──
      chat = await AIChat.findOne({ _id: payload.chatId, userId }).exec();
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Grab latest user + assistant messages for context
      const messages = chat.messages;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (!previousAnswer && messages[i].role === 'assistant') {
          previousAnswer = messages[i].content;
        }
        if (!previousQuery && messages[i].role === 'user') {
          previousQuery = messages[i].content;
        }
        if (previousQuery && previousAnswer) break;
      }
    } else {
      // ── First message → create new chat with title = question ──
      chat = await AIChat.create({
        userId,
        title: payload.question.trim().slice(0, 100),
        messages: [],
      });
    }

    // Save user message
    chat.messages.push({
      role: 'user',
      content: payload.question,
      timestamp: new Date(),
    } as any);

    // Build RAG payload
    const ragPayload: Record<string, any> = { query: payload.question };
    if (previousQuery) ragPayload.previous_query = previousQuery;
    if (previousAnswer) ragPayload.previous_answer = previousAnswer;

    const response = await axios.post(
      `${ragHost}/api/v1/rag/query`,
      ragPayload,
      {
        headers: {
          'x-auth-key': ragApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    // Save assistant message
    chat.messages.push({
      role: 'assistant',
      content: response.data.answer,
      timestamp: new Date(),
      isSourceVerified: response?.data?.source_verified,
      sources: (response?.data?.sources ?? []).map((src: any) => ({
        fileType: src.file_type,
        displayName: src.display_name,
        pages: src.pages_display,
        location: src.location,
        chapter: src.chapter,
        subChapter: src.subchapter,
        section: src.section,
      })),
    } as any);

    await chat.save();

    return {
      chatId: chat._id,
      title: chat.title,
      ...response.data,
    };
  } catch (error: any) {
    console.error('Error calling RAG host:', error.response?.data || error.message);
    throw error;
  }
};

//Get all chats for a user
const getUserChats = async (userId: string, filters: any, skip = 0,
    limit = 10) => {
    const query: any = { userId: userId };

    if (filters?.keyword) {
        const escaped = filters.keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.title = { $regex: escaped, $options: 'i' };
    }

    const result = await infinitePaginate(
        AIChat,
        query,
        skip,
        limit,
        []
    );

    return result;
};

//Get a single chat by ID
const getChatById = async (chatId: string, userId: string): Promise<IChat> => {
    const chat = await AIChat.findOne({
        _id: new Types.ObjectId(chatId),
        userId: new Types.ObjectId(userId)
    });

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    return chat;
};

//Update chat title
const updateChatTitle = async (chatId: string, userId: string, title: string): Promise<IChat> => {
    const chat = await AIChat.findOneAndUpdate(
        { _id: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) },
        { title },
        { new: true }
    );

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }

    return chat;
};

//Delete a chat (soft delete)
const deleteChat = async (chatId: string, userId: string): Promise<void> => {
    const chat = await AIChat.findByIdAndDelete(
        { _id: new Types.ObjectId(chatId), userId: new Types.ObjectId(userId) }
    );

    if (!chat) {
        throw new AppError(httpStatus.NOT_FOUND, "Chat not found");
    }
};

export const ChatServices = {
    askQuestion,
    getUserChats,
    getChatById,
    updateChatTitle,
    deleteChat,
};