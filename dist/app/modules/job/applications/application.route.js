"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const application_controller_1 = require("./application.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const multer_config_1 = require("../../../config/multer.config");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const router = express_1.default.Router();
// Apply on Job
router.post("/apply", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), application_controller_1.ApplicationControllers.applyOnJob);
// Withdraw
router.patch("/withdraw/:applicationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), application_controller_1.ApplicationControllers.withdrawApplication);
// Get All
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), application_controller_1.ApplicationControllers.getAllApplications);
// Get Single
router.get("/:applicationId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), application_controller_1.ApplicationControllers.getSingleApplicationById);
router.get("/job/:jobId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), application_controller_1.ApplicationControllers.getApplicationsByJob);
// Update Status
router.patch("/update-status/:applicationId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), application_controller_1.ApplicationControllers.updateStatus);
// Delete
router.delete("/delete/:applicationId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), application_controller_1.ApplicationControllers.deleteApplication);
exports.ApplicationRoutes = router;
