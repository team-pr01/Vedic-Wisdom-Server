import express from "express";
import auth from "../../middlewares/auth";
import { JobControllers } from "./job.controller";
import { UserRole } from "../auth/auth.constants";
import { multerUpload } from "../../config/multer.config";

const router = express.Router();

router.post(
    "/post",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    multerUpload.single("file"),
    JobControllers.postJob
);

router.get("/", JobControllers.getAllJobs);

router.get("/:jobId", JobControllers.getSingleJobById);

router.put(
    "/update/:jobId",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    multerUpload.single("file"),
    JobControllers.updateJob
);

router.delete(
    "/delete/:jobId",
    auth(UserRole.admin),
    JobControllers.deleteJob
);

router.patch(
    "/update-status/:jobId",
    auth(UserRole.admin, UserRole.moderator, UserRole.user),
    JobControllers.updateStatus
);

export const JobRoutes = router;