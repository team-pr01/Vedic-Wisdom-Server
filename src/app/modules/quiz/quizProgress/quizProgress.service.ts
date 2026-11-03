/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { QuizProgress } from "./quizProgress.model";
import Quiz from "../quiz.model";
import AppError from "../../../errors/AppError";
import { User } from "../../auth/auth.model";

// Get User Progress
const getMyProgress = async (quizId: string, userId: string) => {
    const progress = await QuizProgress.findOne({ quizId, userId });
    if (!progress) throw new AppError(httpStatus.NOT_FOUND, "Progress not found. Start the quiz first.");
    return progress;
};

const getMyAllProgress = async (userId: string) => {
  const result = await QuizProgress.find({ userId })
    .populate({
      path: "quizId",
      select: "name type levels",
    })
    .sort({ updatedAt: -1 }); // Optional: Show most recently played first

  return result;
};

// Get Leaderboard
const getLeaderboard = async (quizId: string, userId: string) => {
  // 1. Fetch the Quiz to get the Prize pool
  const quiz = await Quiz.findById(quizId);
  if (!quiz) {
    throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  // 2. Fetch Top 10 Users (Only completed)
  const topUsers = await QuizProgress.find({ quizId, isCompleted: true })
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
    const rank = index + 1;
    const prizeKey = prizeKeys[index] as keyof typeof quiz.prize;
    
    // If the admin put a prize amount for this rank, use it. Otherwise, default to 0.
    const prizeAmount = quiz.prize?.[prizeKey] || 0;

    return {
      rank: rank,
      userId: user.userId?._id || null,
      name: (user.userId as any)?.name || "Unknown",
      profilePicture: (user.userId as any)?.profilePicture || null,
      quizId: user.quizId,
      // Add prize details
      prizeAmount: prizeAmount,
      currency: quiz.prize?.currency || "BDT",
    };
  });

  // 4. Find the Current User's Rank
  const userProgress = await QuizProgress.findOne({ quizId, userId });
  
  let yourRank = null;
  let yourPrize = 0;

  if (userProgress && userProgress.isCompleted) {
    // Count how many people scored higher or had a faster time
    yourRank = await QuizProgress.countDocuments({
      quizId,
      isCompleted: true,
      $or: [
        { totalScore: { $gt: userProgress.totalScore } },
        { 
          totalScore: userProgress.totalScore, 
          overallTimeTaken: { $lt: userProgress.overallTimeTaken } 
        },
      ],
    }) + 1;

    // Conditionally get the prize for the current user's rank
    if (yourRank <= 10) {
      const yourPrizeKey = prizeKeys[yourRank - 1] as keyof typeof quiz.prize;
      yourPrize = Number(quiz.prize?.[yourPrizeKey] || 0);
    }
  }

  return {
    leaderboard,
    yourRank,
    yourPrize,
    currency: quiz.prize?.currency || "BDT",
  };
};

// Claim Reward
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

const submitPaymentDetails = async (
  quizId: string,
  userId: string,
  paymentDetails: {
    method: string;
    accountName?: string;
    branchName?: string;
    routingNumber?: string;
    accountNumber: string;
  }
) => {
  const progress = await QuizProgress.findOne({ quizId, userId });

  if (!progress) {
    throw new AppError(httpStatus.NOT_FOUND, "Quiz progress not found");
  }

  // Ensure they are actually a winner and haven't claimed it yet
  if (!progress.isCompleted || !progress.rank || progress.rank > 10) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are not eligible for a prize.");
  }

  if (progress.isRewardClaimed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reward has already been claimed.");
  }

  // Update progress with payment details
  progress.paymentDetails = paymentDetails;
  progress.isRewardClaimed = true;
  progress.rewardClaimMethod = "payment";

  await progress.save();

  return progress;
};

const submitCoinRequest = async (quizId: string, userId: string) => {
  const progress = await QuizProgress.findOne({ quizId, userId });

  if (!progress) {
    throw new AppError(httpStatus.NOT_FOUND, "Quiz progress not found");
  }

  if (!progress.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have not completed the quiz yet.");
  }

  if (progress.isRewardClaimed) {
    throw new AppError(httpStatus.BAD_REQUEST, "Reward has already been claimed.");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

  // 1. Calculate Rank Dynamically
  const rank = await QuizProgress.countDocuments({
    quizId,
    isCompleted: true,
    $or: [
      { totalScore: { $gt: progress.totalScore } },
      {
        totalScore: progress.totalScore,
        overallTimeTaken: { $lt: progress.overallTimeTaken },
      },
    ],
  }) + 1;

  if (rank > 10) {
    throw new AppError(httpStatus.BAD_REQUEST, "You are not within the top 10 to claim a reward.");
  }

  // 2. Calculate the prize based on the dynamic rank
  const prizeKeys = [
    "firstPrize", "secondPrize", "thirdPrize", "fourthPrize", "fifthPrize",
    "sixthPrize", "seventhPrize", "eighthPrize", "ninthPrize", "tenthPrize"
  ];
  const prizeKey = prizeKeys[rank - 1] as keyof typeof quiz.prize;
  const prizeAmount = Number(quiz.prize?.[prizeKey] || 0);

  if (prizeAmount <= 0) {
    throw new AppError(httpStatus.BAD_REQUEST, "No prize amount set for your rank.");
  }

  // 3. Save the rank, prize, and request
  progress.rank = rank;
  progress.isRewardClaimed = true;
  progress.rewardClaimMethod = "coins";
  progress.prizeAmountWon = prizeAmount;
  
  await progress.save();

  return progress;
};


export const QuizProgressServices = {
    getMyProgress,
    getMyAllProgress,
    getLeaderboard,
    claimReward,
    submitPaymentDetails,
    submitCoinRequest,
};