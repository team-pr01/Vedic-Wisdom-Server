import httpStatus from "http-status";
import { AiServices } from "./ai.service";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import AppError from "../../errors/AppError";

// AI Chat Controller
const aiChat = catchAsync(async (req, res) => {
  const { message } = req.body;

  const result = await AiServices.aiChat(message);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "AI response generated successfully",
    data: result,
  });
});

const translateShloka = catchAsync(async (req, res) => {
  const { textId, languageCodes } = req.body;

  if (!textId || !languageCodes || !Array.isArray(languageCodes) || languageCodes.length === 0) {
   throw new AppError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const updatedText = await AiServices.translateShloka(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Shloka translated successfully",
    data: updatedText,
  });
});

const generateRecipe = catchAsync(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw new AppError(httpStatus.BAD_REQUEST, "Command is required");
  }

  const result = await AiServices.generateRecipe(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recipe generated successfully",
    data: result,
  });
});

const generateQuiz = catchAsync(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new AppError(httpStatus.BAD_REQUEST, "Title is required");
  }

  const newQuiz = await AiServices.generateQuiz(title);

  if (!newQuiz) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to generate quiz"
    );
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Quiz generated and saved successfully",
    data: newQuiz,
  });
});

const translateNews = catchAsync(async (req, res) => {
  const translations = await AiServices.translateNews(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "News translated and saved successfully",
    data: translations,
  });
});

const generateKundli = catchAsync(async (req, res) => {
  const { name, birthDate, birthTime, birthPlace } = req.body;

  if (!name || !birthDate || !birthTime || !birthPlace) {
    throw new AppError(httpStatus.BAD_REQUEST, "All fields (name, birthDate, birthTime, birthPlace) are required");
  }

  const result = await AiServices.generateKundli({ name, birthDate, birthTime, birthPlace });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Kundli generated successfully",
    data: result,
  });
});

const generateMuhurta = catchAsync(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw new AppError(httpStatus.BAD_REQUEST, "Query is required to generate Muhurta");
  }

  const result = await AiServices.generateMuhurta(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Muhurta generated successfully",
    data: result,
  });
});

const generateVastuAnalysis = catchAsync(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw new AppError(httpStatus.BAD_REQUEST, "Query is required for Vastu analysis");
  }

  const result = await AiServices.generateVastuAnalysis(query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Vastu analysis generated successfully",
    data: result,
  });
});



export const AiControllers = {
  aiChat,
  translateShloka,
  generateRecipe,
  generateQuiz,
  translateNews,
  generateKundli,
  generateMuhurta,
  generateVastuAnalysis
};
