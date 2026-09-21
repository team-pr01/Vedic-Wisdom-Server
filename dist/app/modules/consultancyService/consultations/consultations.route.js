"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const consultations_controller_1 = require("./consultations.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
// Book a consultation (user)
router.post("/book", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.bookConsultation);
// Get all consultations (admin)
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.getAllConsultations);
// Get my consultations (logged-in user)
router.get("/my-consultations", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.getMyConsultations);
// Get single consultation by ID
router.get("/:consultationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.getSingleConsultationById);
// Schedule consultation route
router.put("/schedule/:consultationId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.scheduleConsultation);
// Update consultation status (admin)
router.put("/update-status/:consultationId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.updateConsultationStatus);
// Delete consultation (admin)
router.delete("/delete/:consultationId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), consultations_controller_1.ConsultationControllers.deleteConsultation);
exports.ConsultationRoutes = router;
