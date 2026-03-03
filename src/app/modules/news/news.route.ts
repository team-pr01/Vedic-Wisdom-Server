import express from "express";
import auth from "../../middlewares/auth";
import { NewsControllers } from "./news.controller";
import { multerUpload } from "../../config/multer.config";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  NewsControllers.addNews
);

router.get("/", NewsControllers.getAllNews);
router.get("/:newsId", NewsControllers.getSingleNewsById);

router.put(
  "/update/:newsId",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  NewsControllers.updateNews
);
router.delete(
  "/delete/:newsId",
  auth(UserRole.admin, UserRole.moderator),
  NewsControllers.deleteNews
);
router.patch(
  "/like/:newsId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  NewsControllers.toggleLikeNewsController
);

router.patch(
  "/view/:newsId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  NewsControllers.viewNews
);

export const NewsRoutes = router;