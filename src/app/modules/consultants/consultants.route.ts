import express from "express";
import auth from "../../middlewares/auth";
import { multerUpload } from "../../config/multer.config";
import { UserRole } from "../auth/auth.constants";
import { ConsultantControllers } from "./consultants.controller";

const router = express.Router();

// For admin only
router.post(
  "/add",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  ConsultantControllers.addConsultant
);

router.get("/", ConsultantControllers.getAllConsultants);
router.get("/:consultantId", ConsultantControllers.getSingleConsultantsById);

router.put(
  "/update/:consultantId",
  multerUpload.single("file"),
  auth(UserRole.admin, UserRole.moderator),
  ConsultantControllers.updateConsultant
);

router.delete("/delete/:consultantId", auth(UserRole.admin, UserRole.moderator), ConsultantControllers.deleteConsultant);

export const ConsultantsRoutes = router;
