// routes/subscription.routes.ts
import express from "express";
import auth from "../../middlewares/auth";
import { SubscriptionController } from "./subscription.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

// Admin routes
router.get(
  "/",
  auth(UserRole.admin, UserRole.moderator),
  SubscriptionController.getAllSubscriptions
);

// User routes
router.get(
  "/my-subscriptions",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.getUserSubscriptions
);

router.post(
  "/",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.createSubscription
);

router.get(
  "/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.getSingleSubscription
);

router.patch(
  "/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.updateSubscription
);

router.delete(
  "/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.deleteSubscription
);

router.patch(
  "/:id/cancel",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.cancelSubscription
);

router.patch(
  "/:id/renew",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.renewSubscription
);

export default router;