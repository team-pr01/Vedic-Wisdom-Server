import { User } from "../auth/auth.model";
import { IQuiz } from "./quiz.interface";
import Quiz from "./quiz.model";

// Add Quiz (Admin)
const addQuiz = async (payload: IQuiz) => {
  const result = await Quiz.create(payload);
  return result;
};

// Update Quiz (Admin)
const updateQuiz = async (quizId: string, payload: Partial<IQuiz>) => {
  const result = await Quiz.findByIdAndUpdate(quizId, payload, { new: true });
  return result;
};

// Delete Quiz (Admin)
const deleteQuiz = async (quizId: string) => {
  const result = await Quiz.findByIdAndDelete(quizId);
  return result;
};

// Get All Quizzes
const getAllQuizzes = async () => {
  const result = await Quiz.find();
  return result;
};

// Get Quiz by ID
const getQuizById = async (quizId: string) => {
  const result = await Quiz.findById(quizId);
  return result;
};

// Participate in Quiz (User)
const participateInQuiz = async (
  quizId: string,
  userId: string,
  answers: { questionId: string; selectedAnswer: string }[]
) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new Error("Quiz not found");

  let score = 0;
  quiz.questions.forEach((q, index) => {
    if (answers[index]?.selectedAnswer === String(q.correctAnswer)) score++;
  });

  const result = {
    quizId,
    userId,
    totalQuestions: quiz.questions.length,
    score,
    percentage: (score / quiz.questions.length) * 100,
  };

  // Update user's totalQuizTaken
  const updatedUser = await User.findOneAndUpdate(
  { _id: userId },
  { $inc: { totalQuizTaken: 1 } },
  { new: true } // returns the updated document
);
console.log(updatedUser?.totalQuizTaken);
  return result;
};

export const QuizService = {
  addQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizById,
  getAllQuizzes,
  participateInQuiz,
};
