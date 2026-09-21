"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AyurvedaRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const ayurveda_controller_1 = require("./ayurveda.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), ayurveda_controller_1.AyurvedaControllers.addAyurveda);
router.get("/", ayurveda_controller_1.AyurvedaControllers.getAllAyurveda);
router.get("/:ayurvedaId", ayurveda_controller_1.AyurvedaControllers.getSingleAyurvedaById);
router.put("/update/:ayurvedaId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), ayurveda_controller_1.AyurvedaControllers.updateAyurveda);
router.delete("/delete/:ayurvedaId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), ayurveda_controller_1.AyurvedaControllers.deleteAyurveda);
exports.AyurvedaRoutes = router;
