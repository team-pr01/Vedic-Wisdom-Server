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
const auth_model_1 = require("../auth/auth.model");
const quiz_model_1 = __importDefault(require("./quiz.model"));
// Add Quiz (Admin)
const addQuiz = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.create(payload);
    return result;
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
// Get All Quizzes
const getAllQuizzes = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.find();
    return result;
});
// Get Quiz by ID
const getQuizById = (quizId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield quiz_model_1.default.findById(quizId);
    return result;
});
// Participate in Quiz (User)
const participateInQuiz = (quizId, userId, answers) => __awaiter(void 0, void 0, void 0, function* () {
    const quiz = yield quiz_model_1.default.findById(quizId);
    if (!quiz)
        throw new Error("Quiz not found");
    let score = 0;
    quiz.questions.forEach((q, index) => {
        var _a;
        if (((_a = answers[index]) === null || _a === void 0 ? void 0 : _a.selectedAnswer) === String(q.correctAnswer))
            score++;
    });
    const result = {
        quizId,
        userId,
        totalQuestions: quiz.questions.length,
        score,
        percentage: (score / quiz.questions.length) * 100,
    };
    // Update user's totalQuizTaken
    const updatedUser = yield auth_model_1.User.findOneAndUpdate({ _id: userId }, { $inc: { totalQuizTaken: 1 } }, { new: true } // returns the updated document
    );
    console.log(updatedUser === null || updatedUser === void 0 ? void 0 : updatedUser.totalQuizTaken);
    return result;
});
exports.QuizService = {
    addQuiz,
    updateQuiz,
    deleteQuiz,
    getQuizById,
    getAllQuizzes,
    participateInQuiz,
};
