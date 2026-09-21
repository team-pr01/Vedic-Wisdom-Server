import express from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "../../modules/auth/auth.constants";
import { AudioBookPurchaseControllers } from "./audioBookPurchase.controller";

const router = express.Router();

router.post(
    "/purchase",
    auth(UserRole.user, UserRole.admin, UserRole.moderator),
    AudioBookPurchaseControllers.purchaseAudioBook
);

router.get(
    "/my",
    auth(UserRole.user, UserRole.admin, UserRole.moderator),
    AudioBookPurchaseControllers.getMyPurchasedAudioBooks
);

// Admin only routes
router.get(
    "/all",
    auth(UserRole.admin, UserRole.moderator),
    AudioBookPurchaseControllers.getAllPurchases
);

router.get(
    "/check/:audioBookId",
    auth(UserRole.user, UserRole.admin, UserRole.moderator),
    AudioBookPurchaseControllers.checkOwnership
);

router.get(
    "/:purchaseId",
    auth(UserRole.admin, UserRole.moderator),
    AudioBookPurchaseControllers.getPurchaseById
);

export const AudioBookPurchaseRoutes = router;