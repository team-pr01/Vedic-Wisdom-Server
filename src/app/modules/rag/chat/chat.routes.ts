import express from "express";
import auth from "../../../middlewares/auth";
import { ChatControllers } from "./chat.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();


// Ask a question (Vedic AI)
router.post(
    "/ask",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    ChatControllers.askQuestion
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
  "/update-title/:chatId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.updateChatTitle
);

// Delete chat
router.delete(
  "/delete/:chatId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ChatControllers.deleteChat
);

// ==================== EXPORT ====================

export const AIChatRoutes = router;