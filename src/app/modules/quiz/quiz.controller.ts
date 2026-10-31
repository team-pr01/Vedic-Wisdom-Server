import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { QuizService } from "./quiz.services";

// Add Quiz
const addQuiz = catchAsync(async (req, res) => {
  const payload = { ...req.body, createdBy: req.user.id };
  const result = await QuizService.addQuiz(payload);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz added successfully",
    data: result,
  });
});

// Get all quizzes
const getAllQuizzes = catchAsync(async (req, res) => {
  const { keyword, status, type, skip = "0", limit = "10" } = req.query;

  const result = await QuizService.getAllQuizzes(
    keyword as string,
    status as string,
    type as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All quizzes fetched successfully",
    data: result,
  });
});

// Get active quizzes
const getActiveQuizzes = catchAsync(async (req, res) => {
  const { keyword, type, skip = "0", limit = "10" } = req.query;

  const result = await QuizService.getActiveQuizzes(
    keyword as string,
    type as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Active quizzes fetched successfully",
    data: result,
  });
});

// Update Quiz
const updateQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await QuizService.updateQuiz(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz updated successfully",
    data: result,
  });
});

// Delete Quiz
const deleteQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await QuizService.deleteQuiz(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz deleted successfully",
    data: result,
  });
});

// Get Quiz by ID
const getSingleQuizById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await QuizService.getSingleQuizById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz fetched successfully",
    data: result,
  });
});


const startQuiz = catchAsync(async (req, res) => {
  const { quizId } = req.params;
  const userId = req.user.userId;

  const result = await QuizService.startQuiz(quizId, userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz started successfully",
    data: result,
  });
});

const submitLevelAnswers = catchAsync(async (req, res) => {
  const { quizId, levelNo } = req.params;
  const { answers, timeTaken } = req.body;
  const userId = req.user.userId;

  const result = await QuizService.submitLevelAnswers(
    quizId,
    Number(levelNo),
    userId,
    answers,
    Number(timeTaken)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Level submitted successfully",
    data: result,
  });
});

export const QuizController = {
  addQuiz,
  getAllQuizzes,
  getActiveQuizzes,
  updateQuiz,
  deleteQuiz,
  getSingleQuizById,
  startQuiz,
  submitLevelAnswers
};
