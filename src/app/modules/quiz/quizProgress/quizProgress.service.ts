/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { QuizProgress } from "./quizProgress.model";
import Quiz from "../quiz.model";
import AppError from "../../../errors/AppError";
import { User } from "../../auth/auth.model";



// 2. Get User Progress
const getMyProgress = async (quizId: string, userId: string) => {
    const progress = await QuizProgress.findOne({ quizId, userId });
    if (!progress) throw new AppError(httpStatus.NOT_FOUND, "Progress not found. Start the quiz first.");
    return progress;
};



// 4. Get Leaderboard
const getLeaderboard = async (quizId: string) => {
    const leaderboard = await QuizProgress.find({ quizId, isCompleted: true })
        .sort({ totalScore: -1, overallTimeTaken: 1 }) // Sort by score, then time
        .limit(10)
        .populate("userId", "name profilePicture");

    return leaderboard;
};

// 5. Claim Reward
const claimReward = async (
    quizId: string,
    userId: string,
    rewardClaimMethod: "coins" | "payment",
    paymentDetails?: { method: string; accountNumber: string }
) => {
    const progress = await QuizProgress.findOne({ quizId, userId });
    if (!progress) throw new AppError(httpStatus.NOT_FOUND, "Progress not found");

    if (progress.isRewardClaimed) {
        throw new AppError(httpStatus.BAD_REQUEST, "Reward already claimed");
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

    // Calculate Rank dynamically (or you can run a CRON job to assign ranks)
    const rank = await QuizProgress.countDocuments({
        quizId,
        isCompleted: true,
        $or: [
            { totalScore: { $gt: progress.totalScore } },
            { totalScore: progress.totalScore, overallTimeTaken: { $lt: progress.overallTimeTaken } },
        ],
    }) + 1;

    if (rank > 10) {
        throw new AppError(httpStatus.BAD_REQUEST, "You are not within the top 10 to claim a reward.");
    }

    // Get prize amount based on rank
    const prizeKey = `prize${["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth"][rank - 1]}`;
    const prizeAmount = (quiz.prize as any)[prizeKey] || 0;

    progress.rank = rank;
    progress.prizeAmountWon = prizeAmount;
    progress.isRewardClaimed = true;
    progress.rewardClaimMethod = rewardClaimMethod;

    if (rewardClaimMethod === "coins") {
        // Add coins to user
        await User.findByIdAndUpdate(userId, { $inc: { coins: prizeAmount } });
    } else if (rewardClaimMethod === "payment" && paymentDetails) {
        progress.paymentDetails = paymentDetails;
    }

    await progress.save();
    return progress;
};

export const QuizProgressServices = {
    getMyProgress,
    getLeaderboard,
    claimReward,
};