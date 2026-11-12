import express from "express";
import auth from "../../middlewares/auth";
import { ConversationControllers } from "./conversation.controller";
import { UserRole } from "../auth/auth.constants";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.get(
  "/group-members/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.getGroupMembers
);


router.post(
  "/access/:targetUserId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.accessChat
);

router.post(
  "/group/create",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  ConversationControllers.createGroupChat
);

router.patch(
  "/group/update-info/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  ConversationControllers.updateGroupInfo
);

router.patch(
  "/add-members/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.addGroupMembers
);

// Get Inbox Chat List
router.get(
  "/inbox",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.getMyInbox
);

router.delete(
  "/delete-chat/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.deleteChatForUser
);

// Leave Group Route
router.patch(
  "/leave-group/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.leaveGroup
);

router.patch(
  "/make-admin/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.makeGroupAdmin
);

router.patch(
  "/remove-admin/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.removeFromAdmin
);

router.patch(
  "/remove-member/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.removeFromGroup
);

router.patch("/request/:conversationId", auth(UserRole.user, UserRole.admin, UserRole.moderator), ConversationControllers.handleMessageRequest);

router.patch(
  "/toggle-block/:conversationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.toggleBlockUser
);

// Get Blocked List Route
router.get(
  "/blocked-list",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ConversationControllers.getMyBlockedUsers
);


export const ConversationRoutes = router;