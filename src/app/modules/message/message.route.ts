import express from "express";
import { MessageControllers } from "./message.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

// All routes require authentication
router.use(auth(UserRole.user, UserRole.admin, UserRole.moderator));

// Get messages between two users
router.get("/:otherUserId", MessageControllers.getMessages);

// Get unread count
router.get("/unread/count/:otherUserId", MessageControllers.getUnreadCountWithUser);

router.patch("/read/:otherUserId", MessageControllers.markMessagesAsRead);

export const MessageRoutes = router;