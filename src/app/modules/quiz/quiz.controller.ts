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

// Get all courses
const getAllQuizzes = catchAsync(async (req, res) => {
  const result = await QuizService.getAllQuizzes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All quizzes fetched successfully",
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
const getQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await QuizService.getQuizById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz fetched successfully",
    data: result,
  });
});

// Participate in Quiz
const participateQuiz = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { answers, userId } = req.body;
  const result = await QuizService.participateInQuiz(id, userId, answers);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz completed",
    data: result,
  });
});

export const QuizController = {
  addQuiz,
  getAllQuizzes,
  updateQuiz,
  deleteQuiz,
  getQuiz,
  participateQuiz,
};
