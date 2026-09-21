import express from "express";
import { PopupControllers } from "./popup.controller";
import { multerUpload } from "../../config/multer.config";
import auth from "../../middlewares/auth";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/add",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  PopupControllers.createPopup
);

router.get("/", PopupControllers.getAllPopups);
router.get("/:popupId", PopupControllers.getPopupById);

router.put(
  "/update/:popupId",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  PopupControllers.updatePopup
);

router.delete(
  "/delete/:popupId",
  auth(UserRole.admin, UserRole.moderator),
  PopupControllers.deletePopup
);

export const PopupRoutes = router;
