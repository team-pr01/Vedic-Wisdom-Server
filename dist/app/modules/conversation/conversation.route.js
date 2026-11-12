"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const conversation_controller_1 = require("./conversation.controller");
const auth_constants_1 = require("../auth/auth.constants");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
router.get("/group-members/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.getGroupMembers);
router.post("/access/:targetUserId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.accessChat);
router.post("/group/create", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), conversation_controller_1.ConversationControllers.createGroupChat);
router.patch("/group/update-info/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), conversation_controller_1.ConversationControllers.updateGroupInfo);
router.patch("/add-members/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.addGroupMembers);
// Get Inbox Chat List
router.get("/inbox", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.getMyInbox);
router.delete("/delete-chat/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.deleteChatForUser);
// Leave Group Route
router.patch("/leave-group/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.leaveGroup);
router.patch("/make-admin/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.makeGroupAdmin);
router.patch("/remove-admin/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.removeFromAdmin);
router.patch("/remove-member/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.removeFromGroup);
router.patch("/request/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.handleMessageRequest);
router.patch("/toggle-block/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.toggleBlockUser);
// Get Blocked List Route
router.get("/blocked-list", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), conversation_controller_1.ConversationControllers.getMyBlockedUsers);
exports.ConversationRoutes = router;
