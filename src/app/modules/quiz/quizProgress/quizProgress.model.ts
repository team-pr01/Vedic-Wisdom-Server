import { Schema, model } from "mongoose";
import { TQuizProgress } from "./quizProgress.interface";

const levelProgressSchema = new Schema(
  {
    levelNo: { type: Number, required: true },
    status: {
      type: String,
      enum: ["locked", "unlocked", "completed", "failed"],
      default: "locked",
    },
    score: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { _id: false }
);

const quizProgressSchema = new Schema<TQuizProgress>(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    currentLevel: { type: Number, default: 1 },
    levelProgress: { type: [levelProgressSchema], default: [] },
    totalScore: { type: Number, default: 0 },
    totalCorrectAnswers: { type: Number, default: 0 },
    overallTimeTaken: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    
    // Reward Tracking
    rank: { type: Number },
    prizeAmountWon: { type: Number },
    isRewardClaimed: { type: Boolean, default: false },
    rewardClaimMethod: { type: String, enum: ["coins", "payment"] },
    paymentDetails: {
      method: { type: String },
      accountNumber: { type: String },
    },
  },
  { timestamps: true }
);

// Ensure a user can only have ONE progress document per quiz
quizProgressSchema.index({ quizId: 1, userId: 1 }, { unique: true });

// Index for generating the Leaderboard quickly
quizProgressSchema.index({ quizId: 1, isCompleted: 1, totalScore: -1, overallTimeTaken: 1 });

export const QuizProgress = model<TQuizProgress>("QuizProgress", quizProgressSchema);