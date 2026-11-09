"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const message_controller_1 = require("./message.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
// Fetch chat history for a specific conversation
router.get("/:conversationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), message_controller_1.MessageControllers.getMessages);
exports.MessageRoutes = router;
