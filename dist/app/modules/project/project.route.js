"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectRoutes = void 0;
// project.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const multer_config_1 = require("../../config/multer.config");
const project_controller_1 = require("./project.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
// Create a project
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), project_controller_1.ProjectController.addProject);
// Get all projects (public)
router.get("/", project_controller_1.ProjectController.getAllProjects);
// Get single project by ID (public)
router.get("/:projectId", project_controller_1.ProjectController.getSingleProjectById);
// Update project
router.put("/update/:projectId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), project_controller_1.ProjectController.updateProject);
// Delete project
router.delete("/delete/:projectId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), project_controller_1.ProjectController.deleteProject);
exports.ProjectRoutes = router;
