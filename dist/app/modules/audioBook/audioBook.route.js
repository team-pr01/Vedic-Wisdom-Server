"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioBookRoutes = void 0;
const express_1 = __importDefault(require("express"));
const audioBook_controller_1 = require("./audioBook.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const multer_config_1 = require("../../config/multer.config");
const router = express_1.default.Router();
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin), multer_config_1.multerUpload.single("file"), audioBook_controller_1.AudioBookControllers.addAudioBook);
router.get("/", audioBook_controller_1.AudioBookControllers.getAllAudioBooks);
router.get("/:audioBookId", audioBook_controller_1.AudioBookControllers.getSingleAudioBook);
router.patch("/update/:audioBookId", (0, auth_1.default)(auth_constants_1.UserRole.admin), multer_config_1.multerUpload.single("file"), audioBook_controller_1.AudioBookControllers.updateAudioBook);
router.delete("/delete/:audioBookId", (0, auth_1.default)(auth_constants_1.UserRole.admin), audioBook_controller_1.AudioBookControllers.deleteAudioBook);
exports.AudioBookRoutes = router;
