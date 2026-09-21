import express from "express";
import auth from "../../middlewares/auth";
import { SavedItemControllers } from "./savedBook.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/save",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SavedItemControllers.saveItem
);

router.delete(
  "/unsave/:itemId/:itemType",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SavedItemControllers.unsaveItem
);

router.get(
  "/my",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SavedItemControllers.getMySavedItems
);

router.get(
  "/saved-item-count",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  SavedItemControllers.getSavedCount
);

export const SavedItemRoutes = router;