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
// Get User Progress
const getMyProgress = (quizId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Progress not found. Start the quiz first.");
    return progress;
});
const getMyAllProgress = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quizProgress_model_1.QuizProgress.find({ userId })
        .populate({
        path: "quizId",
        select: "name type levels",
    })
        .sort({ updatedAt: -1 }); // Optional: Show most recently played first
    return result;
});
// Get Leaderboard
const getLeaderboard = (quizId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // 1. Fetch the Quiz to get the Prize pool
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    }
    // 2. Fetch Top 10 Users (Only completed)
    const topUsers = yield quizProgress_model_1.QuizProgress.find({ quizId, isCompleted: true })
        .sort({ totalScore: -1, overallTimeTaken: 1 })
        .limit(10)
        .populate("userId", "name profilePicture")
        .lean();
    // Define the prize keys in order
    const prizeKeys = [
        "firstPrize",
        "secondPrize",
        "thirdPrize",
        "fourthPrize",
        "fifthPrize",
        "sixthPrize",
        "seventhPrize",
        "eighthPrize",
        "ninthPrize",
        "tenthPrize",
    ];
    // 3. Format the Top 10 list and add the conditional prize
    const leaderboard = topUsers.map((user, index) => {
        var _a, _b, _c, _d, _e;
        const rank = index + 1;
        const prizeKey = prizeKeys[index];
        // If the admin put a prize amount for this rank, use it. Otherwise, default to 0.
        const prizeAmount = ((_a = quiz.prize) === null || _a === void 0 ? void 0 : _a[prizeKey]) || 0;
        return {
            rank: rank,
            userId: ((_b = user.userId) === null || _b === void 0 ? void 0 : _b._id) || null,
            name: ((_c = user.userId) === null || _c === void 0 ? void 0 : _c.name) || "Unknown",
            profilePicture: ((_d = user.userId) === null || _d === void 0 ? void 0 : _d.profilePicture) || null,
            quizId: user.quizId,
            // Add prize details
            prizeAmount: prizeAmount,
            currency: ((_e = quiz.prize) === null || _e === void 0 ? void 0 : _e.currency) || "BDT",
        };
    });
    // 4. Find the Current User's Rank
    const userProgress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    let yourRank = null;
    let yourPrize = 0;
    if (userProgress && userProgress.isCompleted) {
        // Count how many people scored higher or had a faster time
        yourRank = (yield quizProgress_model_1.QuizProgress.countDocuments({
            quizId,
            isCompleted: true,
            $or: [
                { totalScore: { $gt: userProgress.totalScore } },
                {
                    totalScore: userProgress.totalScore,
                    overallTimeTaken: { $lt: userProgress.overallTimeTaken }
                },
            ],
        })) + 1;
        // Conditionally get the prize for the current user's rank
        if (yourRank <= 10) {
            const yourPrizeKey = prizeKeys[yourRank - 1];
            yourPrize = Number(((_a = quiz.prize) === null || _a === void 0 ? void 0 : _a[yourPrizeKey]) || 0);
        }
    }
    return {
        leaderboard,
        yourRank,
        yourPrize,
        currency: ((_b = quiz.prize) === null || _b === void 0 ? void 0 : _b.currency) || "BDT",
    };
});
// Claim Reward
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
const submitPaymentDetails = (quizId, userId, paymentDetails) => __awaiter(void 0, void 0, void 0, function* () {
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz progress not found");
    }
    // Ensure they are actually a winner and haven't claimed it yet
    if (!progress.isCompleted || !progress.rank || progress.rank > 10) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are not eligible for a prize.");
    }
    if (progress.isRewardClaimed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Reward has already been claimed.");
    }
    // Update progress with payment details
    progress.paymentDetails = paymentDetails;
    progress.isRewardClaimed = true;
    progress.rewardClaimMethod = "payment";
    yield progress.save();
    return progress;
});
const submitCoinRequest = (quizId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz progress not found");
    }
    if (!progress.isCompleted) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have not completed the quiz yet.");
    }
    if (progress.isRewardClaimed) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Reward has already been claimed.");
    }
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    // 1. Calculate Rank Dynamically
    const rank = (yield quizProgress_model_1.QuizProgress.countDocuments({
        quizId,
        isCompleted: true,
        $or: [
            { totalScore: { $gt: progress.totalScore } },
            {
                totalScore: progress.totalScore,
                overallTimeTaken: { $lt: progress.overallTimeTaken },
            },
        ],
    })) + 1;
    if (rank > 10) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You are not within the top 10 to claim a reward.");
    }
    // 2. Calculate the prize based on the dynamic rank
    const prizeKeys = [
        "firstPrize", "secondPrize", "thirdPrize", "fourthPrize", "fifthPrize",
        "sixthPrize", "seventhPrize", "eighthPrize", "ninthPrize", "tenthPrize"
    ];
    const prizeKey = prizeKeys[rank - 1];
    const prizeAmount = Number(((_a = quiz.prize) === null || _a === void 0 ? void 0 : _a[prizeKey]) || 0);
    if (prizeAmount <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "No prize amount set for your rank.");
    }
    // 3. Save the rank, prize, and request
    progress.rank = rank;
    progress.isRewardClaimed = true;
    progress.rewardClaimMethod = "coins";
    progress.prizeAmountWon = prizeAmount;
    yield progress.save();
    return progress;
});
exports.QuizProgressServices = {
    getMyProgress,
    getMyAllProgress,
    getLeaderboard,
    claimReward,
    submitPaymentDetails,
    submitCoinRequest,
};
