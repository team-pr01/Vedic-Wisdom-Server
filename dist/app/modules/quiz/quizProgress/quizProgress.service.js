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
exports.QuizProgressServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const quizProgress_model_1 = require("./quizProgress.model");
const quiz_model_1 = __importDefault(require("../quiz.model"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const auth_model_1 = require("../../auth/auth.model");
// 2. Get User Progress
const getMyProgress = (quizId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Progress not found. Start the quiz first.");
    return progress;
});
// 4. Get Leaderboard
const getLeaderboard = (quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const leaderboard = yield quizProgress_model_1.QuizProgress.find({ quizId, isCompleted: true })
        .sort({ totalScore: -1, overallTimeTaken: 1 }) // Sort by score, then time
        .limit(10)
        .populate("userId", "name profilePicture");
    return leaderboard;
});
// 5. Claim Reward
const claimReward = (quizId, userId, rewardClaimMethod, paymentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Progress not found");
    if (progress.isRewardClaimed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Reward already claimed");
    }
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    // Calculate Rank dynamically (or you can run a CRON job to assign ranks)
    const rank = (yield quizProgress_model_1.QuizProgress.countDocuments({
        quizId,
        isCompleted: true,
        $or: [
            { totalScore: { $gt: progress.totalScore } },
            { totalScore: progress.totalScore, overallTimeTaken: { $lt: progress.overallTimeTaken } },
        ],
    })) + 1;
    if (rank > 10) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are not within the top 10 to claim a reward.");
    }
    // Get prize amount based on rank
    const prizeKey = `prize${["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][rank - 1]}`;
    const prizeAmount = quiz.prize[prizeKey] || 0;
    progress.rank = rank;
    progress.prizeAmountWon = prizeAmount;
    progress.isRewardClaimed = true;
    progress.rewardClaimMethod = rewardClaimMethod;
    if (rewardClaimMethod === "coins") {
        // Add coins to user
        yield auth_model_1.User.findByIdAndUpdate(userId, { $inc: { coins: prizeAmount } });
    }
    else if (rewardClaimMethod === "payment" && paymentDetails) {
        progress.paymentDetails = paymentDetails;
    }
    yield progress.save();
    return progress;
});
exports.QuizProgressServices = {
    getMyProgress,
    getLeaderboard,
    claimReward,
};
