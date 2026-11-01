"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopBannerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const shopBanner_controller_1 = require("./shopBanner.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const router = express_1.default.Router();
// Public route (Users need to see active banners)
router.get("/", shopBanner_controller_1.ShopBannerControllers.getAllBanners);
// Admin only routes
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), sendImageToCloudinary_1.upload.single("file"), shopBanner_controller_1.ShopBannerControllers.addBanner);
router.patch("/update-status/:bannerId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), shopBanner_controller_1.ShopBannerControllers.updateBannerStatus);
router.delete("/delete/:bannerId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), shopBanner_controller_1.ShopBannerControllers.deleteBanner);
exports.ShopBannerRoutes = router;
