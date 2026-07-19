// project.routes.ts
import express from "express";
import auth from "../../middlewares/auth";
import { multerUpload } from "../../config/multer.config";
import { ProjectController } from "./project.controller";
import { UserRole } from "../auth/auth.constants";

const router = express.Router();

// Create a project
router.post(
  "/add",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  ProjectController.addProject
);

// Get all projects (public)
router.get("/", ProjectController.getAllProjects);

// Get single project by ID (public)
router.get(
  "/:projectId",
  ProjectController.getSingleProjectById
);

// Update project
router.put(
  "/update/:projectId",
  auth(UserRole.admin, UserRole.moderator),
  multerUpload.single("file"),
  ProjectController.updateProject
);

// Delete project
router.delete(
  "/delete/:projectId",
  auth(UserRole.admin, UserRole.moderator),
  ProjectController.deleteProject
);

export const ProjectRoutes = router;