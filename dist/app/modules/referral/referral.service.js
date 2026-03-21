"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralServices = void 0;
const http_status_1 = __importDefault(require("http-status"));
const auth_model_1 = require("../auth/auth.model");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const referral_model_1 = __importDefault(require("./referral.model"));
const coinTransaction_model_1 = __importDefault(require("./coinTransaction/coinTransaction.model"));
const generateReferralCode_1 = require("../../utils/generateReferralCode");
/* Generate Referral Code */
const generateReferralCode = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    if (user === null || user === void 0 ? void 0 : user.referralCode) {
        return user === null || user === void 0 ? void 0 : user.referralCode;
    }
    const code = yield (0, generateReferralCode_1.generateUniqueReferralCode)();
    user.referralCode = code;
    yield user.save();
    return code;
});
/* Handle Referral During Signup */
const handleReferralReward = (newUserId, referralCode) => __awaiter(void 0, void 0, void 0, function* () {
    const referrer = yield auth_model_1.User.findOne({ referralCode });
    if (!referrer)
        return null;
    if (referrer._id.toString() === newUserId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Self referral not allowed");
    }
    // get current referral count for rank
    const referralCount = yield referral_model_1.default.countDocuments({
        referrer: referrer._id,
    });
    const rank = referralCount + 1;
    const referral = yield referral_model_1.default.create({
        referrer: referrer._id,
        referredUser: newUserId,
        rank,
    });
    referrer.referralCount += 1;
    let coins = 0;
    if (referrer.referralCount === 2) {
        coins = 10;
        referrer.premiumUnlocked = true;
    }
    else if (referrer.referralCount > 2) {
        coins = 5;
    }
    if (coins > 0) {
        referrer.coins += coins;
        yield coinTransaction_model_1.default.create({
            userId: referrer._id,
            coins,
            type: "REFERRAL",
            referenceId: referral._id,
        });
    }
    yield referrer.save();
    return referral;
});
/* Get My Referrals */
const getMyReferrals = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const referrals = yield referral_model_1.default.find({ referrer: userId })
        .populate("referredUser", "name profilePicture")
        .sort({ rank: 1 });
    return referrals;
});
/* Get My Coin Transactions */
const getMyCoins = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    return coinTransaction_model_1.default.find({ userId }).sort({ createdAt: -1 });
});
exports.ReferralServices = {
    generateReferralCode,
    handleReferralReward,
    getMyReferrals,
    getMyCoins,
};
