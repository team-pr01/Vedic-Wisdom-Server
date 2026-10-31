import { Types } from "mongoose";

export type TLevelProgress = {
  levelNo: number;
  status: "locked" | "unlocked" | "completed" | "failed";
  score: number;
  correctAnswers: number;
  completedAt?: Date;
};

export type TQuizProgress = {
  quizId: Types.ObjectId;
  userId: Types.ObjectId;
  
  // Level tracking
  currentLevel: number;
  levelProgress: TLevelProgress[];
  
  // Overall tracking (for Leaderboard)
  totalScore: number;
  totalCorrectAnswers: number;
  overallTimeTaken: number; // in seconds (for tie-breakers)
  isCompleted: boolean;
  
  // Winner & Reward tracking
  rank?: number;
  prizeAmountWon?: number;
  isRewardClaimed: boolean;
  rewardClaimMethod?: "coins" | "payment";
  paymentDetails?: {
    method: string;
    accountNumber: string;
  };
};