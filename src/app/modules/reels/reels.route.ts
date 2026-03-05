import express from "express";
import auth from "../../middlewares/auth";
import { ReelControllers } from "./reels.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

// For admin only
router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  ReelControllers.addReel
);

router.get("/", ReelControllers.getAllReels);
router.get("/:reelId", ReelControllers.getSingleReelById);

router.patch(
  "/like/:reelId",
  auth(
    UserRole.admin,
    UserRole.moderator,
    UserRole.user,
  ),
  ReelControllers.toggleLikeReel
);

router.put(
  "/update/:reelId",
  auth(UserRole.admin, UserRole.moderator),
  ReelControllers.updateReel
);

router.delete(
  "/delete/:reelId",
  auth(UserRole.admin, UserRole.moderator),
  ReelControllers.deleteReel
);

export const ReelsRoutes = router;
