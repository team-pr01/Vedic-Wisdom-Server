import express from "express";
import auth from "../../middlewares/auth";
import { TempleController } from "./temple.controller";
import { UserRole } from "../auth/auth.constants";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

/* ---------------- ADD TEMPLE ---------------- */
router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  multerUpload.array("files", 10), // max 10 images
  TempleController.addTemple
);

/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
router.get("/", TempleController.getAllTemples);

/* ---------------- GET SINGLE ---------------- */
router.get("/:templeId", TempleController.getSingleTempleById);

/* ---------------- UPDATE TEMPLE ---------------- */
router.put("/:templeId", auth(UserRole.admin, UserRole.moderator, UserRole.user), multerUpload.array("images", 10), TempleController.updateTemple);

/* ---------------- UPDATE STATUS (ADMIN ONLY) ---------------- */
router.patch(
    "/:templeId/status",
    auth(UserRole.admin, UserRole.moderator),
    TempleController.updateTempleStatus
);

/* ---------------- DELETE (ADMIN ONLY) ---------------- */
router.delete(
    "/:templeId",
    auth(UserRole.admin, UserRole.moderator),
    TempleController.deleteTemple
);

export const TempleRoutes = router;