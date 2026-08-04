"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioBookPurchaseRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../../modules/auth/auth.constants");
const audioBookPurchase_controller_1 = require("./audioBookPurchase.controller");
const router = express_1.default.Router();
router.post("/purchase", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), audioBookPurchase_controller_1.AudioBookPurchaseControllers.purchaseAudioBook);
router.get("/my", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), audioBookPurchase_controller_1.AudioBookPurchaseControllers.getMyPurchasedAudioBooks);
// Admin only routes
router.get("/all", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), audioBookPurchase_controller_1.AudioBookPurchaseControllers.getAllPurchases);
router.get("/check/:audioBookId", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), audioBookPurchase_controller_1.AudioBookPurchaseControllers.checkOwnership);
router.get("/:purchaseId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), audioBookPurchase_controller_1.AudioBookPurchaseControllers.getPurchaseById);
exports.AudioBookPurchaseRoutes = router;
