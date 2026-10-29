import express from "express";
import { ShopBannerControllers } from "./shopBanner.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { upload } from "../../../utils/sendImageToCloudinary";

const router = express.Router();

// Public route (Users need to see active banners)
router.get("/", ShopBannerControllers.getAllBanners);

// Admin only routes
router.post(
    "/add",
    auth(UserRole.admin, UserRole.moderator),
    upload.single("file"),
    ShopBannerControllers.addBanner
);

router.patch(
    "/update-status/:bannerId",
    auth(UserRole.admin, UserRole.moderator),
    ShopBannerControllers.updateBannerStatus
);

router.delete(
    "/delete/:bannerId",
    auth(UserRole.admin, UserRole.moderator),
    ShopBannerControllers.deleteBanner
);

export const ShopBannerRoutes = router;