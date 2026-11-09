import express from "express";
import { ReportControllers } from "./report.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

router.post("/", auth(UserRole.user, UserRole.admin, UserRole.moderator), ReportControllers.submitReport);

export const ReportRoutes = router;