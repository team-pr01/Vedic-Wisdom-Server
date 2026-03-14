import express from "express";
import auth from "../../../middlewares/auth";
import { ReportMantraController } from "./reportMantra.controller";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

router.post("/report", ReportMantraController.reportMantra);

router.get(
  "/",
  auth(UserRole.admin, UserRole.moderator),
  ReportMantraController.getAllReportedMantras
);

router.get(
  "/:reportId",
  auth(UserRole.admin, UserRole.moderator),
  ReportMantraController.getSingleReportedMantra
);

router.put(
  "/update-status/:reportId",
  auth(UserRole.admin, UserRole.moderator),
  ReportMantraController.updateReportStatus
);

router.put(
  "/resolve/:textId",
  auth(UserRole.admin, UserRole.moderator),
  ReportMantraController.resolveIssue
);

router.delete(
  "/delete/:reportId",
  auth(UserRole.admin, UserRole.moderator),
  ReportMantraController.deleteReportedMantra
);


export const ReportMantraRoutes = router;
