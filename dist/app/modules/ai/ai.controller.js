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
exports.AiControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ai_service_1 = require("./ai.service");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
// AI Chat Controller
const aiChat = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { message } = req.body;
    const result = yield ai_service_1.AiServices.aiChat(message);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "AI response generated successfully",
        data: result,
    });
}));
const translateShloka = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { textId, languageCodes } = req.body;
    if (!textId || !languageCodes || !Array.isArray(languageCodes) || languageCodes.length === 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Missing required fields");
    }
    const updatedText = yield ai_service_1.AiServices.translateShloka(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Shloka translated successfully",
        data: updatedText,
    });
}));
const generateRecipe = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    if (!query) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Command is required");
    }
    const result = yield ai_service_1.AiServices.generateRecipe(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Recipe generated successfully",
        data: result,
    });
}));
const generateQuiz = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Title is required");
    }
    const newQuiz = yield ai_service_1.AiServices.generateQuiz(title);
    if (!newQuiz) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Failed to generate quiz");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Quiz generated and saved successfully",
        data: newQuiz,
    });
}));
const translateNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const translations = yield ai_service_1.AiServices.translateNews(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "News translated and saved successfully",
        data: translations,
    });
}));
const generateKundli = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, birthDate, birthTime, birthPlace } = req.body;
    if (!name || !birthDate || !birthTime || !birthPlace) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "All fields (name, birthDate, birthTime, birthPlace) are required");
    }
    const result = yield ai_service_1.AiServices.generateKundli({ name, birthDate, birthTime, birthPlace });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Kundli generated successfully",
        data: result,
    });
}));
const generateMuhurta = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    if (!query) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Query is required to generate Muhurta");
    }
    const result = yield ai_service_1.AiServices.generateMuhurta(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Muhurta generated successfully",
        data: result,
    });
}));
const generateVastuAnalysis = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { query } = req.body;
    if (!query) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Query is required for Vastu analysis");
    }
    const result = yield ai_service_1.AiServices.generateVastuAnalysis(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Vastu analysis generated successfully",
        data: result,
    });
}));
exports.AiControllers = {
    aiChat,
    translateShloka,
    generateRecipe,
    generateQuiz,
    translateNews,
    generateKundli,
    generateMuhurta,
    generateVastuAnalysis
};
