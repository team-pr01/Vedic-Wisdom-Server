import express from "express";
import { MessageControllers } from "./message.controller";
import { UserRole } from "../../auth/auth.constants";
import auth from "../../../middlewares/auth";

const router = express.Router();

router.patch(
  "/react/:messageId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  MessageControllers.reactToMessage
);

router.delete(
  "/delete-for-me/:messageId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  MessageControllers.deleteMessageForMe
);

router.delete(
  "/delete-for-everyone/:messageId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  MessageControllers.deleteMessageForEveryone
);

// Fetch chat history for a specific conversation
router.get(
  "/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  MessageControllers.getMessages
);


export const MessageRoutes = router;