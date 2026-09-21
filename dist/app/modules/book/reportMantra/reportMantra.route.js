"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportMantraRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const reportMantra_controller_1 = require("./reportMantra.controller");
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
router.post("/report", reportMantra_controller_1.ReportMantraController.reportMantra);
router.get("/", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), reportMantra_controller_1.ReportMantraController.getAllReportedMantras);
router.get("/:reportId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), reportMantra_controller_1.ReportMantraController.getSingleReportedMantra);
router.put("/update-status/:reportId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), reportMantra_controller_1.ReportMantraController.updateReportStatus);
router.put("/resolve/:textId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), reportMantra_controller_1.ReportMantraController.resolveIssue);
router.delete("/delete/:reportId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), reportMantra_controller_1.ReportMantraController.deleteReportedMantra);
exports.ReportMantraRoutes = router;
