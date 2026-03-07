"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const job_controller_1 = require("./job.controller");
const auth_constants_1 = require("../auth/auth.constants");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
router.post("/post", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.single("file"), job_controller_1.JobControllers.postJob);
router.get("/", job_controller_1.JobControllers.getAllJobs);
router.get("/:jobId", job_controller_1.JobControllers.getSingleJobById);
router.put("/update/:jobId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.single("file"), job_controller_1.JobControllers.updateJob);
router.delete("/delete/:jobId", (0, auth_1.default)(auth_constants_1.UserRole.admin), job_controller_1.JobControllers.deleteJob);
router.patch("/update-status/:jobId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), job_controller_1.JobControllers.updateStatus);
exports.JobRoutes = router;
