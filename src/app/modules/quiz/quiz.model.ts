import { Schema, model } from "mongoose";
import { TQuestion, TQuiz } from "./quiz.interface";

const QuestionSchema = new Schema<TQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
});

const QuizSchema = new Schema<TQuiz>(
  {
    type : { type: String, required: true },
    title: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

const Quiz = model<TQuiz>("Quiz", QuizSchema);

export default Quiz;