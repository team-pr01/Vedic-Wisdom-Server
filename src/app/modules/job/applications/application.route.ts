import express from "express";
import { ApplicationControllers } from "./application.controller";
import { UserRole } from "../../auth/auth.constants";
import { multerUpload } from "../../../config/multer.config";
import auth from "../../../middlewares/auth";

const router = express.Router();

// Apply on Job
router.post(
  "/apply",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  ApplicationControllers.applyOnJob
);

// Withdraw
router.patch(
  "/withdraw/:applicationId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ApplicationControllers.withdrawApplication
);

// Get All
router.get(
  "/",
  auth(UserRole.admin, UserRole.moderator),
  ApplicationControllers.getAllApplications
);

// Get Single
router.get(
  "/:applicationId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ApplicationControllers.getSingleApplicationById
);

router.get(
  "/job/:jobId",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  ApplicationControllers.getApplicationsByJob
);

// Update Status
router.patch(
  "/update-status/:applicationId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ApplicationControllers.updateStatus
);

// Delete
router.delete(
  "/delete/:applicationId",
  auth(UserRole.admin, UserRole.moderator, UserRole.user),
  ApplicationControllers.deleteApplication
);

export const ApplicationRoutes = router;