/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { TQuiz } from "./quiz.interface";
import Quiz from "./quiz.model";
import { QuizProgress } from "./quizProgress/quizProgress.model";

// Add Quiz (Admin)
const addQuiz = async (payload: TQuiz) => {
  const result = await Quiz.create(payload);
  return result;
};

const getAllQuizzes = async (
  keyword?: string,
  name?: string,
  status?: string,
  type?: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  if (keyword) {
    query.name = { $regex: keyword, $options: "i" };
  }

  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  if (status) {
    query.status = status;
  }

  if (type) {
    query.type = type;
  }

  return infinitePaginate(Quiz, query, skip, limit, []);
};

// Get Active Quizzes (Users only)
const getActiveQuizzes = async (
  keyword?: string,
  name?: string,
  type?: string,
  skip = 0,
  limit = 10
) => {
  const filter: any = { status: "active" };

  if (keyword) filter.name = { $regex: keyword, $options: "i" };
  if (name) filter.name = { $regex: name, $options: "i" };
  if (type) filter.type = type;

  const result = await infinitePaginate(Quiz, filter, skip, limit, []);

  const sanitizedData = result.data.map((quiz: any) => {
    const quizObj = quiz.toObject ? quiz.toObject() : quiz;
    
    if (quizObj.levels) {
      quizObj.levels = quizObj.levels.map((level: any) => {
        if (level.questions) {
          level.questions = level.questions.map((q: any) => {
            delete q.correctAnswer;
            return q;
          });
        }
        return level;
      });
    }
    return quizObj;
  });

  return {
    ...result,
    data: sanitizedData
  };
};

// Get Single Quiz
const getSingleQuizById = async (quizId: string) => {
  const result = await Quiz.findById(quizId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");
  }
  return result;
};

const getQuizQuestionsByLevelNo = async (quizId: string, levelNo: number) => {
  const quiz = await Quiz.findById(quizId);
  
  if (!quiz) {
    throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");
  }

  // Find the requested level
  const level = quiz.levels.find((l) => l.no === Number(levelNo));
  
  if (!level) {
    throw new AppError(httpStatus.NOT_FOUND, "Level not found in this quiz");
  }

  // Calculate the last level number
  // We use Math.max to find the highest level number in the levels array
  const levelNumbers = quiz.levels.map((l) => l.no);
  const lastLevelNo = Math.max(...levelNumbers);

  const sanitizedQuestions = level.questions.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
  }));

  return {
    quizName: quiz.name,
    levelNo: level.no,
    levelName: level.name,
    duration: level.duration,
    passingScore: level.passingScore,
    totalQuestions: sanitizedQuestions.length,
    questions: sanitizedQuestions,
    lastLevelNo,
  };
};


// Update Quiz (Admin)
const updateQuiz = async (quizId: string, payload: Partial<TQuiz>) => {
  const result = await Quiz.findByIdAndUpdate(quizId, payload, { new: true });
  return result;
};

// Delete Quiz (Admin)
const deleteQuiz = async (quizId: string) => {
  const result = await Quiz.findByIdAndDelete(quizId);
  return result;
};


// 1. Start or Resume a Quiz
const startQuiz = async (quizId: string, userId: string) => {
  
  const quiz = await Quiz.findById(quizId);
  console.log(quiz);
  if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

  // Check if progress already exists
  let progress = await QuizProgress.findOne({ quizId, userId });

  if (!progress) {
    // Create new progress
    const initialLevels = quiz.levels.map((level, index) => ({
      levelNo: level.no,
      status: index === 0 ? "unlocked" : "locked", // Unlock Level 1
      score: 0,
      correctAnswers: 0,
    }));

    progress = await QuizProgress.create({
      quizId,
      userId,
      currentLevel: 1,
      levelProgress: initialLevels,
      isCompleted: false,
    });
  }

  return progress;
};

// 3. Submit Level Answers
const submitLevelAnswers = async (
    quizId: string,
    levelNo: number,
    userId: string,
    answers: { questionIndex: number; selectedOption: number }[],
    timeTaken: number // in seconds
) => {
  console.log(quizId);
  console.log(userId);
    const quiz = await Quiz.findById(quizId);
    if (!quiz) throw new AppError(httpStatus.NOT_FOUND, "Quiz not found");

    const progress = await QuizProgress.findOne({ quizId, userId });
    if (!progress) throw new AppError(httpStatus.NOT_FOUND, "Progress not found");

    // Find the level in Quiz and Progress
    const quizLevel = quiz.levels.find((l) => l.no === levelNo);
    const progressLevel = progress.levelProgress.find((l) => l.levelNo === levelNo);

    if (!quizLevel || !progressLevel) {
        throw new AppError(httpStatus.NOT_FOUND, "Level not found");
    }

    if (progressLevel.status === "locked") {
        throw new AppError(httpStatus.FORBIDDEN, "This level is locked.");
    }

    if (progressLevel.status === "completed") {
        throw new AppError(httpStatus.BAD_REQUEST, "You have already completed this level.");
    }

    // Calculate Score
    let correctAnswers = 0;
    answers.forEach((ans) => {
        const correctIndex = quizLevel.questions[ans.questionIndex]?.correctAnswer;
        if (correctIndex === ans.selectedOption) {
            correctAnswers++;
        }
    });

    const isPassed = correctAnswers >= quizLevel.passingScore;

    // Update Progress Level
    progressLevel.score = correctAnswers;
    progressLevel.correctAnswers = correctAnswers;
    progressLevel.status = isPassed ? "completed" : "failed";
    progressLevel.completedAt = new Date();

    // Update Overall Progress
    progress.totalCorrectAnswers += correctAnswers;
    progress.totalScore += correctAnswers * 10; // Example: 10 points per correct answer
    progress.overallTimeTaken += timeTaken;

    if (isPassed) {
        // Unlock next level if exists
        const nextLevelNo = levelNo + 1;
        const nextLevelProgress = progress.levelProgress.find((l) => l.levelNo === nextLevelNo);
        const nextQuizLevel = quiz.levels.find((l) => l.no === nextLevelNo);

        if (nextQuizLevel && nextLevelProgress) {
            nextLevelProgress.status = "unlocked";
            progress.currentLevel = nextLevelNo;
        } else {
            // No next level, quiz is finished!
            progress.isCompleted = true;
        }
    }

    await progress.save();
    return progress;
};

export const QuizService = {
  addQuiz,
  getAllQuizzes,
  getActiveQuizzes,
  getSingleQuizById,
  getQuizQuestionsByLevelNo,
  updateQuiz,
  deleteQuiz,
  startQuiz,
  submitLevelAnswers
};
