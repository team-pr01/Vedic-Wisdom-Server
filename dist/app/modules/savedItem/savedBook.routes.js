"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedItemRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const savedBook_controller_1 = require("./savedBook.controller");
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
router.post("/save", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), savedBook_controller_1.SavedItemControllers.saveItem);
router.delete("/unsave/:itemId/:itemType", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), savedBook_controller_1.SavedItemControllers.unsaveItem);
router.get("/my", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), savedBook_controller_1.SavedItemControllers.getMySavedItems);
router.get("/saved-item-count", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), savedBook_controller_1.SavedItemControllers.getSavedCount);
exports.SavedItemRoutes = router;
