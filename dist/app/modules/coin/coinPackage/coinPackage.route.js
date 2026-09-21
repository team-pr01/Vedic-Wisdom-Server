"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinPackageRoutes = void 0;
// routes/coinPackage.routes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const coinPackage_controller_1 = require("./coinPackage.controller");
const router = express_1.default.Router();
// Admin routes
router.post("/add", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinPackage_controller_1.CoinPackageControllers.addCoinPackage);
router.put("/update/:packageId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinPackage_controller_1.CoinPackageControllers.updateCoinPackage);
router.delete("/delete/:packageId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinPackage_controller_1.CoinPackageControllers.deleteCoinPackage);
// Public routes (users)
router.get("/all", coinPackage_controller_1.CoinPackageControllers.getAllCoinPackages);
router.get("/:packageId", coinPackage_controller_1.CoinPackageControllers.getSingleCoinPackageById);
exports.CoinPackageRoutes = router;
