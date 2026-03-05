import express from "express";
import auth from "../../middlewares/auth";
import { CourseControllers } from "./course.controller";
import { multerUpload } from "../../config/multer.config";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  CourseControllers.addCourse
);

router.get("/", CourseControllers.getAllCourses);
router.get("/:courseId", CourseControllers.getSingleCourseById);

router.put(
  "/update/:courseId",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  CourseControllers.updateCourse
);

router.delete(
  "/delete/:courseId",
  auth(UserRole.admin, UserRole.moderator),
  CourseControllers.deleteCourse
);

export const CourseRoutes = router;