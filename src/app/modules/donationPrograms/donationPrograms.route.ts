import express from "express";
import auth from "../../middlewares/auth";
import { multerUpload } from "../../config/multer.config";
import { DonationProgramsController } from "./donationPrograms.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

// Create a donation program
router.post(
  "/add",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  DonationProgramsController.addDonationProgram
);

// Get all donation programs (public)
router.get("/", DonationProgramsController.getAllDonationPrograms);

// Get single donation program by ID (public)
router.get(
  "/:donationProgramId",
  DonationProgramsController.getSingleDonationProgramById
);

// Update donation program
router.put(
  "/update/:donationProgramId",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  DonationProgramsController.updateDonationProgram
);

// Delete donation program
router.delete(
  "/delete/:donationProgramId",
  auth(UserRole.admin, UserRole.moderator),
  DonationProgramsController.deleteDonationProgram
);

export const DonationProgramRoutes = router;
