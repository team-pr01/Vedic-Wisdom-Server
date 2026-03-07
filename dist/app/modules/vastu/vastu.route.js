"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VastuRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const vastu_controllers_1 = require("./vastu.controllers");
const router = express_1.default.Router();
// For admin only
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastu_controllers_1.VastuControllers.addVastu);
router.get("/", vastu_controllers_1.VastuControllers.getAllVastus);
router.get("/:vastuId", vastu_controllers_1.VastuControllers.getSingleVastuById);
router.put("/update/:vastuId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastu_controllers_1.VastuControllers.updateVastu);
router.delete("/delete/:vastuId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), vastu_controllers_1.VastuControllers.deleteVastu);
exports.VastuRoutes = router;
