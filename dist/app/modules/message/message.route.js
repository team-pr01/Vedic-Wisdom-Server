"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
// All routes require authentication
router.use((0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator));
// Get messages between two users
router.get("/:otherUserId", message_controller_1.MessageControllers.getMessages);
// Get unread count
router.get("/unread/count/:otherUserId", message_controller_1.MessageControllers.getUnreadCountWithUser);
router.patch("/read/:otherUserId", message_controller_1.MessageControllers.markMessagesAsRead);
exports.MessageRoutes = router;
