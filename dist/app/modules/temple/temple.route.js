"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TempleRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const temple_controller_1 = require("./temple.controller");
const auth_constants_1 = require("../auth/auth.constants");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
/* ---------------- ADD TEMPLE ---------------- */
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 10), // max 10 images
temple_controller_1.TempleController.addTemple);
/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
router.get("/", temple_controller_1.TempleController.getAllTemples);
/* ---------------- GET SINGLE ---------------- */
router.get("/:templeId", temple_controller_1.TempleController.getSingleTempleById);
/* ---------------- UPDATE TEMPLE ---------------- */
router.put("/update/:templeId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 10), temple_controller_1.TempleController.updateTemple);
/* ---------------- UPDATE STATUS (ADMIN ONLY) ---------------- */
router.patch("/update-status/:templeId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), temple_controller_1.TempleController.updateTempleStatus);
/* ---------------- DELETE (ADMIN ONLY) ---------------- */
router.delete("/delete/:templeId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), temple_controller_1.TempleController.deleteTemple);
router.post("/add-event/:templeId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 5), temple_controller_1.TempleController.addEvent);
router.patch("/update-event/:templeId/event/:eventId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), multer_config_1.multerUpload.array("files", 5), temple_controller_1.TempleController.updateEvent);
router.delete("/delete-event/:templeId/event/:eventId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.user), temple_controller_1.TempleController.deleteEvent);
exports.TempleRoutes = router;
