"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const course_controller_1 = require("./course.controller");
const multer_config_1 = require("../../config/multer.config");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), course_controller_1.CourseControllers.addCourse);
router.get("/", course_controller_1.CourseControllers.getAllCourses);
router.get("/:courseId", course_controller_1.CourseControllers.getSingleCourseById);
router.put("/update/:courseId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), multer_config_1.multerUpload.single("file"), course_controller_1.CourseControllers.updateCourse);
router.delete("/delete/:courseId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), course_controller_1.CourseControllers.deleteCourse);
exports.CourseRoutes = router;
