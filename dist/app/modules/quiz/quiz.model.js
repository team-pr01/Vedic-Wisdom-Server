"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const QuestionSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
});
const QuizSchema = new mongoose_1.Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    questions: [QuestionSchema],
}, { timestamps: true });
const Quiz = (0, mongoose_1.model)("Quiz", QuizSchema);
exports.default = Quiz;
