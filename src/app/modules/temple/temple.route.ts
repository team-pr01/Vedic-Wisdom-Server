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
router.put("/update/:templeId", auth(UserRole.admin, UserRole.moderator, UserRole.user), multerUpload.array("files", 10), TempleController.updateTemple);

/* ---------------- UPDATE STATUS (ADMIN ONLY) ---------------- */
router.patch(
    "/update-status/:templeId",
    auth(UserRole.admin, UserRole.moderator),
    TempleController.updateTempleStatus
);

/* ---------------- DELETE (ADMIN ONLY) ---------------- */
router.delete(
    "/delete/:templeId",
    auth(UserRole.admin, UserRole.moderator),
    TempleController.deleteTemple
);

export const TempleRoutes = router;