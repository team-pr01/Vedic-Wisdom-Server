import { Schema, model } from "mongoose";
import { TQuiz } from "./quiz.interface";

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (val: string[]) {
          return val.length >= 2;
        },
        message: "A question must have at least 2 options.",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0, // Index of the correct answer (e.g., 0 for option A)
    },
  }
);

const levelSchema = new Schema(
  {
    no: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    passingScore: {
      type: Number,
      required: true,
      default: 27,
    },
    duration: {
      type: Number, // Duration in minutes
      required: true,
      default: 30,
    },
    questions: {
      type: [questionSchema],
      required: true,
    },
  },
  { _id: false }
);

const prizeSchema = new Schema(
  {
    currency: {
      type: String,
      required: true,
      default: "BDT",
    },
    firstPrize: { type: Number, default: 0 },
    secondPrize: { type: Number, default: 0 },
    thirdPrize: { type: Number, default: 0 },
    fourthPrize: { type: Number, default: 0 },
    fifthPrize: { type: Number, default: 0 },
    sixthPrize: { type: Number, default: 0 },
    seventhPrize: { type: Number, default: 0 },
    eighthPrize: { type: Number, default: 0 },
    ninthPrize: { type: Number, default: 0 },
    tenthPrize: { type: Number, default: 0 },
  },
);

// MAIN QUIZ SCHEMA
const quizSchema = new Schema<TQuiz>(
  {
    type: {
      type: String,
      enum: ["free", "paid"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    levels: {
      type: [levelSchema],
      required: true,
    },
    prize: {
      type: prizeSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

//INDEXES

quizSchema.index({ name: "text" });
quizSchema.index({ status: 1, type: 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = model<TQuiz>("Quiz", quizSchema);

export default Quiz;