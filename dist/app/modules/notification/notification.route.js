"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoutes = void 0;
// app/modules/notification/notification.route.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const notification_controller_1 = require("./notification.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/send", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), notification_controller_1.NotificationController.sendNotification);
router.get("/my", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), notification_controller_1.NotificationController.getMyNotifications);
router.patch("/read/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), notification_controller_1.NotificationController.markRead);
exports.NotificationRoutes = router;
