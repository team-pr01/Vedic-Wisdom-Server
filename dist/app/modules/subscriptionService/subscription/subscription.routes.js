"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
// routes/subscription.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const subscription_controller_1 = require("./subscription.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
router.post("/subscribe", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.createSubscription);
// Admin only routes
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.getAllSubscriptions);
// User routes
router.get("/my-subscriptions", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.getMySubscriptions);
router.get("/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.getSingleSubscription);
router.put("/update/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.updateSubscription);
router.delete("/delete/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.deleteSubscription);
router.patch("/cancel/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.cancelSubscription);
router.patch("/renew/:id", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscription_controller_1.SubscriptionController.renewSubscription);
exports.SubscriptionRoutes = router;
