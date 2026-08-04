"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIChatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const chat_controller_1 = require("./chat.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
// ==================== CHAT CRUD ====================
// Create new chat
router.post("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.createChat);
// Get all user chats
router.get("/my", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.getUserChats);
// Get single chat
router.get("/:chatId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.getChatById);
// Update chat title
router.patch("/:chatId/title", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.updateChatTitle);
// Delete chat
router.delete("/:chatId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.deleteChat);
// Delete all chats
router.delete("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.deleteAllChats);
// ==================== CHAT MESSAGING ====================
// Send message in chat
router.post("/:chatId/message", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.sendMessage);
// Regenerate last message
router.post("/:chatId/regenerate", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.regenerateLastMessage);
// ==================== EXPORT ====================
exports.AIChatRoutes = router;
