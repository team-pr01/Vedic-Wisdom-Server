import express from "express";
import { ReferralControllers } from "./referral.controller";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

/* Generate Referral Code */
router.post(
  "/generate",
  auth(UserRole.user, UserRole.moderator, UserRole.admin),
  ReferralControllers.generateReferralCode
);

/* Get My Referrals */
router.get(
  "/my-referrals",
  auth(UserRole.user, UserRole.moderator, UserRole.admin),
  ReferralControllers.getMyReferrals
);

/* Get All Referrals of An User */
router.get(
  "/user/:userId",
  auth(UserRole.moderator, UserRole.admin),
  ReferralControllers.getAllReferralsOfAnUser
);

/* Get Coin History */
router.get(
  "/coins",
  auth(UserRole.user, UserRole.moderator, UserRole.admin),
  ReferralControllers.getMyCoins
);

export const ReferralRoutes = router;