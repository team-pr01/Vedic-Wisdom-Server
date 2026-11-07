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

// Get Inbox Chat List
router.get(
  "/inbox",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.getMyInbox
);

export const ConversationRoutes = router;