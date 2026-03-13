import express from "express";
import { VendorControllers } from "./vendor.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { multerUpload } from "../../../config/multer.config";

const router = express.Router();

router.post(
    "/apply",
    auth(UserRole.user),
    multerUpload.array("files", 5),
    VendorControllers.applyVendor
);

router.patch(
    "/update-status/:vendorId",
    auth(UserRole.admin, UserRole.moderator),
    VendorControllers.updateVendorStatus
);

router.get(
    "/my-stats",
    auth(UserRole.user),
    VendorControllers.getMyVendorStats
);

/* Get Pending Applications */
router.get(
    "/pending-requests",
    auth(UserRole.admin, UserRole.moderator),
    VendorControllers.getPendingVendorApplications
);


/* Get All Vendors */
router.get(
    "/",
    auth(UserRole.admin, UserRole.moderator),
    VendorControllers.getAllVendors
);


/* Get Single Vendor */
router.get(
    "/:vendorId",
    auth(UserRole.admin, UserRole.moderator),
    VendorControllers.getSingleVendorById
);


/* Suspend Vendor */
router.patch(
    "/suspend/:vendorId",
    auth(UserRole.admin, UserRole.moderator),
    VendorControllers.suspendVendor
);

export const VendorRoutes = router;