"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendorRoutes = void 0;
const express_1 = __importDefault(require("express"));
const vendor_controller_1 = require("./vendor.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const multer_config_1 = require("../../../config/multer.config");
const router = express_1.default.Router();
router.post("/apply", (0, auth_1.default)(auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 2), vendor_controller_1.VendorControllers.applyVendor);
/* Get Pending Applications */
router.get("/pending-requests", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.getPendingVendorApplications);
/* Get All Vendors */
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.getAllVendors);
router.get("/my-stats", (0, auth_1.default)(auth_constants_1.UserRole.user), vendor_controller_1.VendorControllers.getMyVendorStats);
/* Get Single Vendor */
router.get("/:vendorId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.getSingleVendorById);
router.patch("/update-status/:vendorId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.updateVendorStatus);
/* Suspend Vendor */
router.patch("/suspend/:vendorId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.suspendVendor);
router.patch("/withdraw-suspension/:vendorId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vendor_controller_1.VendorControllers.withdrawVendorSuspension);
exports.VendorRoutes = router;
