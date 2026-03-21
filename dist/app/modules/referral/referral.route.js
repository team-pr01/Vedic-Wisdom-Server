"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralRoutes = void 0;
const express_1 = __importDefault(require("express"));
const referral_controller_1 = require("./referral.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../auth/auth.constants");
const router = express_1.default.Router();
/* Generate Referral Code */
router.post("/generate", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.admin), referral_controller_1.ReferralControllers.generateReferralCode);
/* Get My Referrals */
router.get("/my-referrals", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.admin), referral_controller_1.ReferralControllers.getMyReferrals);
/* Get Coin History */
router.get("/coins", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.moderator, auth_constants_1.UserRole.admin), referral_controller_1.ReferralControllers.getMyCoins);
exports.ReferralRoutes = router;
