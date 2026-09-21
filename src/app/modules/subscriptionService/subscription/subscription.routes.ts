// routes/subscription.routes.ts
import express from "express";
import auth from "../../../middlewares/auth";
import { SubscriptionController } from "./subscription.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();



router.post(
  "/subscribe",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.createSubscription
);

// Admin only routes
router.get(
  "/",
  auth(UserRole.admin, UserRole.moderator),
  SubscriptionController.getAllSubscriptions
);

// User routes
router.get(
  "/my-subscriptions",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.getMySubscriptions
);


router.get(
  "/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.getSingleSubscription
);

router.put(
  "/update/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.updateSubscription
);

router.delete(
  "/delete/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.deleteSubscription
);

router.patch(
  "/cancel/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.cancelSubscription
);

router.patch(
  "/renew/:id",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SubscriptionController.renewSubscription
);

export const SubscriptionRoutes = router;