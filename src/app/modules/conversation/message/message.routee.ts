import express from "express";
import { MessageControllers } from "./message.controller";
import { UserRole } from "../../auth/auth.constants";
import auth from "../../../middlewares/auth";

const router = express.Router();

// Fetch chat history for a specific conversation
router.get(
  "/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  MessageControllers.getMessages
);

export const MessageRoutes = router;