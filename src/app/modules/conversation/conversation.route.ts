import express from "express";
import auth from "../../middlewares/auth";
import { ConversationControllers } from "./conversation.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/access/:targetUserId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.accessChat
);

router.post(
  "/group/create",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.createGroupChat
);

// Get Inbox Chat List
router.get(
  "/inbox",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.getMyInbox
);

router.patch("/request/:conversationId", auth(UserRole.user, UserRole.admin, UserRole.moderator), ConversationControllers.handleMessageRequest);

export const ConversationRoutes = router;