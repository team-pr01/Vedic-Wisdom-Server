// routes/subscriptionPlan.routes.ts
import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";
import { SubscriptionPlanController } from "./subscriptionPlan.controller";

const router = express.Router();

// Admin only routes
router.post(
    "/add",
    auth(UserRole.admin, UserRole.moderator),
    SubscriptionPlanController.createSubscriptionPlan
);

router.get(
    "/",
    auth(UserRole.admin, UserRole.moderator),
    SubscriptionPlanController.getAllSubscriptionPlans
);

router.put(
    "/update/:id",
    auth(UserRole.admin, UserRole.moderator),
    SubscriptionPlanController.updateSubscriptionPlan
);

router.delete(
    "/delete/:id",
    auth(UserRole.admin, UserRole.moderator),
    SubscriptionPlanController.deleteSubscriptionPlan
);

// Public/User routes - Only active plans
router.get(
    "/active-plans",
    SubscriptionPlanController.getActiveSubscriptionPlans
);

router.get(
    "/:id",
    SubscriptionPlanController.getSingleSubscriptionPlan
);

export const SubscriptionPlanRoutes = router;