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
// Ask a question (Vedic AI)
router.post("/ask", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.askQuestion);
// Get all user chats
router.get("/my", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.getUserChats);
// Get single chat
router.get("/:chatId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.getChatById);
// Update chat title
router.patch("/update-title/:chatId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.updateChatTitle);
// Delete chat
router.delete("/delete/:chatId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), chat_controller_1.ChatControllers.deleteChat);
// ==================== EXPORT ====================
exports.AIChatRoutes = router;
