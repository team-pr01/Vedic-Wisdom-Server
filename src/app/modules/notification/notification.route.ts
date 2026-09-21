// app/modules/notification/notification.route.ts
import express from "express";
import auth from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post("/send", auth(UserRole.admin, UserRole.moderator), NotificationController.sendNotification);
router.get("/my", auth(UserRole.admin, UserRole.moderator, UserRole.user), NotificationController.getMyNotifications);
router.patch("/read/:id", auth(UserRole.admin, UserRole.moderator, UserRole.user), NotificationController.markRead);

export const NotificationRoutes = router;