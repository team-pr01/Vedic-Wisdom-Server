"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VastuTipsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const vastuTips_controller_1 = require("./vastuTips.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastuTips_controller_1.VastuTipsControllers.addVastuTips);
router.get("/", vastuTips_controller_1.VastuTipsControllers.getAllVastuTips);
router.get("/:id", vastuTips_controller_1.VastuTipsControllers.getSingleVastuTips);
router.put("/update/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastuTips_controller_1.VastuTipsControllers.updateVastuTips);
router.delete("/delete/:id", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastuTips_controller_1.VastuTipsControllers.deleteVastuTips);
exports.VastuTipsRoutes = router;
