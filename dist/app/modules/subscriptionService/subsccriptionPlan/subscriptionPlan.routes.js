"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPlanRoutes = void 0;
// routes/subscriptionPlan.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const subscriptionPlan_controller_1 = require("./subscriptionPlan.controller");
const router = express_1.default.Router();
// Admin only routes
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscriptionPlan_controller_1.SubscriptionPlanController.createSubscriptionPlan);
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscriptionPlan_controller_1.SubscriptionPlanController.getAllSubscriptionPlans);
router.put("/update/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscriptionPlan_controller_1.SubscriptionPlanController.updateSubscriptionPlan);
router.delete("/delete/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), subscriptionPlan_controller_1.SubscriptionPlanController.deleteSubscriptionPlan);
// Public/User routes - Only active plans
router.get("/active-plans", subscriptionPlan_controller_1.SubscriptionPlanController.getActiveSubscriptionPlans);
router.get("/:id", subscriptionPlan_controller_1.SubscriptionPlanController.getSingleSubscriptionPlan);
exports.SubscriptionPlanRoutes = router;
