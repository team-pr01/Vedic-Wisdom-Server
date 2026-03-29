import express from "express";
import auth from "../../../middlewares/auth";
import { ConsultationControllers } from "./consultations.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

// Book a consultation (user)
router.post(
  "/book",
  auth(
    UserRole.user,
    UserRole.admin,
    UserRole.moderator
  ),
  ConsultationControllers.bookConsultation
);

// Get all consultations (admin)
router.get(
  "/",
  auth(UserRole.admin, UserRole.moderator),
  ConsultationControllers.getAllConsultations
);

// Get my consultations (logged-in user)
router.get(
  "/my-consultations",
  auth(
    UserRole.user,
    UserRole.admin,
    UserRole.moderator,
  ),
  ConsultationControllers.getMyConsultations
);

// Get single consultation by ID
router.get(
  "/:consultationId",
  auth(
    UserRole.user,
    UserRole.admin,
    UserRole.moderator,
  ),
  ConsultationControllers.getSingleConsultationById
);


// Schedule consultation route
router.put(
  "/schedule/:consultationId",
  auth(UserRole.admin, UserRole.moderator),
  ConsultationControllers.scheduleConsultation
);

// Update consultation status (admin)
router.put(
  "/update-status/:consultationId",
  auth(UserRole.admin, UserRole.moderator),
  ConsultationControllers.updateConsultationStatus
);

// Delete consultation (admin)
router.delete(
  "/delete/:consultationId",
  auth(
    UserRole.user,
    UserRole.admin,
    UserRole.moderator,
  ),
  ConsultationControllers.deleteConsultation
);

export const ConsultationRoutes = router;
