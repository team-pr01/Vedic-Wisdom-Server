"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const quiz_services_1 = require("./quiz.services");
// Add Quiz
const addQuiz = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = Object.assign(Object.assign({}, req.body), { createdBy: req.user.id });
    const result = yield quiz_services_1.QuizService.addQuiz(payload);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz added successfully",
        data: result,
    });
}));
// Get all quizzes
const getAllQuizzes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, name, status, type, skip = "0", limit = "10" } = req.query;
    const result = yield quiz_services_1.QuizService.getAllQuizzes(keyword, name, status, type, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All quizzes fetched successfully",
        data: result,
    });
}));
// Get active quizzes
const getActiveQuizzes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, name, type, skip = "0", limit = "10" } = req.query;
    const result = yield quiz_services_1.QuizService.getActiveQuizzes(keyword, name, type, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Active quizzes fetched successfully",
        data: result,
    });
}));
const getQuizQuestionsByLevelNo = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId, levelNo } = req.params;
    const result = yield quiz_services_1.QuizService.getQuizQuestionsByLevelNo(quizId, Number(levelNo));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Level questions fetched successfully",
        data: result,
    });
}));
// Update Quiz
const updateQuiz = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield quiz_services_1.QuizService.updateQuiz(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz updated successfully",
        data: result,
    });
}));
// Delete Quiz
const deleteQuiz = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield quiz_services_1.QuizService.deleteQuiz(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz deleted successfully",
        data: result,
    });
}));
// Get Quiz by ID
const getSingleQuizById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield quiz_services_1.QuizService.getSingleQuizById(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz fetched successfully",
        data: result,
    });
}));
const startQuiz = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId } = req.params;
    const userId = req.user.userId;
    const result = yield quiz_services_1.QuizService.startQuiz(quizId, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz started successfully",
        data: result,
    });
}));
const submitLevelAnswers = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { quizId, levelNo } = req.params;
    const { answers, timeTaken } = req.body;
    const userId = req.user.userId;
    const result = yield quiz_services_1.QuizService.submitLevelAnswers(quizId, Number(levelNo), userId, answers, Number(timeTaken));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Level submitted successfully",
        data: result,
    });
}));
exports.QuizController = {
    addQuiz,
    getAllQuizzes,
    getActiveQuizzes,
    getQuizQuestionsByLevelNo,
    updateQuiz,
    deleteQuiz,
    getSingleQuizById,
    startQuiz,
    submitLevelAnswers
};
