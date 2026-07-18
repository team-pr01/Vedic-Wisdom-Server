"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultantsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const multer_config_1 = require("../../../config/multer.config");
const auth_constants_1 = require("../../auth/auth.constants");
const consultants_controller_1 = require("./consultants.controller");
const router = express_1.default.Router();
// For admin only
router.post("/add", multer_config_1.multerUpload.single("file"), (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultants_controller_1.ConsultantControllers.addConsultant);
router.get("/", consultants_controller_1.ConsultantControllers.getAllConsultants);
router.get("/category/:category", consultants_controller_1.ConsultantControllers.getConsultantsByCategory);
router.get("/:consultantId", consultants_controller_1.ConsultantControllers.getSingleConsultantsById);
router.put("/update/:consultantId", multer_config_1.multerUpload.single("file"), (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultants_controller_1.ConsultantControllers.updateConsultant);
router.delete("/delete/:consultantId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultants_controller_1.ConsultantControllers.deleteConsultant);
exports.ConsultantsRoutes = router;
