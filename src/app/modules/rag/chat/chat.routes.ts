import express from "express";
import auth from "../../../middlewares/auth";
import { ChatControllers } from "./chat.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

// ==================== CHAT CRUD ====================

// Create new chat
router.post(
  "/",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.createChat
);

// Get all user chats
router.get(
  "/my",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.getUserChats
);

// Get single chat
router.get(
  "/:chatId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.getChatById
);

// Update chat title
router.patch(
  "/:chatId/title",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.updateChatTitle
);

// Delete chat
router.delete(
  "/:chatId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.deleteChat
);

// Delete all chats
router.delete(
  "/",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.deleteAllChats
);

// ==================== CHAT MESSAGING ====================

// Send message in chat
router.post(
  "/:chatId/message",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.sendMessage
);

// Regenerate last message
router.post(
  "/:chatId/regenerate",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.regenerateLastMessage
);

// ==================== EXPORT ====================

export const AIChatRoutes = router;