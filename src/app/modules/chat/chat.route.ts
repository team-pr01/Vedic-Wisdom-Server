import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";
import { ChatControllers } from "./chat.controller";

const router = express.Router();

// All routes require authentication
router.use(auth(UserRole.user, UserRole.admin, UserRole.moderator));

router.get("/chat-list", ChatControllers.getChatList);

export const ChatRoutes = router;