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
exports.NewsControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const news_services_1 = require("./news.services");
// Add News
const addNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield news_services_1.NewsServices.addNews(req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "News added successfully",
        data: result,
    });
}));
// Get All
const getAllNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        category: category,
    };
    const result = yield news_services_1.NewsServices.getAllNews(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "News fetched successfully.",
        data: {
            news: result.data,
            meta: result.meta,
        },
    });
}));
// Get Single
const getSingleNewsById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.params;
    const result = yield news_services_1.NewsServices.getSingleNewsById(newsId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "News fetched successfully.",
        data: result,
    });
}));
// Update 
const updateNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.params;
    if (req.body.translations && typeof req.body.translations === "string") {
        req.body.translations = JSON.parse(req.body.translations);
    }
    const result = yield news_services_1.NewsServices.updateNews(newsId, req.body, req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "News updated successfully",
        data: result,
    });
}));
// Delete
const deleteNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.params;
    const result = yield news_services_1.NewsServices.deleteNews(newsId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "News deleted successfully.",
        data: result,
    });
}));
const toggleLikeNewsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.params;
    const userId = req.user.userId;
    const updatedNews = yield news_services_1.NewsServices.toggleLikeNews(newsId, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "News like toggled successfully",
        data: {
            likes: updatedNews.likes,
            likedByUser: updatedNews.likedBy.includes(userId),
        },
    });
}));
const viewNews = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newsId } = req.params;
    const userId = req.user.userId;
    const news = yield news_services_1.NewsServices.addNewsView(newsId, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "News view recorded",
        data: {
            views: news.views
        },
    });
}));
exports.NewsControllers = {
    addNews,
    getAllNews,
    getSingleNewsById,
    updateNews,
    deleteNews,
    toggleLikeNewsController,
    viewNews
};
