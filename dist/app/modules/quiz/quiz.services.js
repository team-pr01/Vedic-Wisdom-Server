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
exports.QuizService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const quiz_model_1 = __importDefault(require("./quiz.model"));
const quizProgress_model_1 = require("./quizProgress/quizProgress.model");
// Add Quiz (Admin)
const addQuiz = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.create(payload);
    return result;
});
const getAllQuizzes = (keyword_1, name_1, status_1, type_1, ...args_1) => __awaiter(void 0, [keyword_1, name_1, status_1, type_1, ...args_1], void 0, function* (keyword, name, status, type, skip = 0, limit = 10) {
    const query = {};
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
    return (0, infinitePaginate_1.infinitePaginate)(quiz_model_1.default, query, skip, limit, []);
});
// Get Active Quizzes (Users only)
const getActiveQuizzes = (keyword_1, name_1, type_1, ...args_1) => __awaiter(void 0, [keyword_1, name_1, type_1, ...args_1], void 0, function* (keyword, name, type, skip = 0, limit = 10) {
    const filter = { status: "active" };
    if (keyword)
        filter.name = { $regex: keyword, $options: "i" };
    if (name)
        filter.name = { $regex: name, $options: "i" };
    if (type)
        filter.type = type;
    const result = yield (0, infinitePaginate_1.infinitePaginate)(quiz_model_1.default, filter, skip, limit, []);
    const sanitizedData = result.data.map((quiz) => {
        const quizObj = quiz.toObject ? quiz.toObject() : quiz;
        if (quizObj.levels) {
            quizObj.levels = quizObj.levels.map((level) => {
                if (level.questions) {
                    level.questions = level.questions.map((q) => {
                        delete q.correctAnswer;
                        return q;
                    });
                }
                return level;
            });
        }
        return quizObj;
    });
    return Object.assign(Object.assign({}, result), { data: sanitizedData });
});
// Get Single Quiz
const getSingleQuizById = (quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.findById(quizId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    }
    return result;
});
const getQuizQuestionsByLevelNo = (quizId, levelNo) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    }
    // Find the requested level
    const level = quiz.levels.find((l) => l.no === Number(levelNo));
    if (!level) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Level not found in this quiz");
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
});
// Update Quiz (Admin)
const updateQuiz = (quizId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.findByIdAndUpdate(quizId, payload, { new: true });
    return result;
});
// Delete Quiz (Admin)
const deleteQuiz = (quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.findByIdAndDelete(quizId);
    return result;
});
// 1. Start or Resume a Quiz
const startQuiz = (quizId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_model_1.default.findById(quizId);
    console.log(quiz);
    if (!quiz)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    // Check if progress already exists
    let progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress) {
        // Create new progress
        const initialLevels = quiz.levels.map((level, index) => ({
            levelNo: level.no,
            status: index === 0 ? "unlocked" : "locked", // Unlock Level 1
            score: 0,
            correctAnswers: 0,
        }));
        progress = yield quizProgress_model_1.QuizProgress.create({
            quizId,
            userId,
            currentLevel: 1,
            levelProgress: initialLevels,
            isCompleted: false,
        });
    }
    return progress;
});
// 3. Submit Level Answers
const submitLevelAnswers = (quizId, levelNo, userId, answers, timeTaken // in seconds
) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(quizId);
    console.log(userId);
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Quiz not found");
    const progress = yield quizProgress_model_1.QuizProgress.findOne({ quizId, userId });
    if (!progress)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Progress not found");
    // Find the level in Quiz and Progress
    const quizLevel = quiz.levels.find((l) => l.no === levelNo);
    const progressLevel = progress.levelProgress.find((l) => l.levelNo === levelNo);
    if (!quizLevel || !progressLevel) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Level not found");
    }
    if (progressLevel.status === "locked") {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "This level is locked.");
    }
    if (progressLevel.status === "completed") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already completed this level.");
    }
    // Calculate Score
    let correctAnswers = 0;
    answers.forEach((ans) => {
        var _a;
        const correctIndex = (_a = quizLevel.questions[ans.questionIndex]) === null || _a === void 0 ? void 0 : _a.correctAnswer;
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
        }
        else {
            // No next level, quiz is finished!
            progress.isCompleted = true;
        }
    }
    yield progress.save();
    return progress;
});
exports.QuizService = {
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
