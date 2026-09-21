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
exports.NewsServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const news_model_1 = __importDefault(require("./news.model"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const addNews = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    let translations = payload.translations;
    if (typeof translations === "string") {
        translations = JSON.parse(translations);
    }
    const payloadData = Object.assign(Object.assign({}, payload), { imageUrl,
        translations });
    const result = yield news_model_1.default.create(payloadData);
    return result;
});
const getAllNews = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    const languageCode = filters.languageCode || "en";
    // 🔥 EXCLUDE trending news from regular feed
    query.isTrending = { $ne: true };
    // CATEGORY FILTER
    if (filters.category) {
        query.category = { $regex: `^${filters.category.trim()}$`, $options: "i" };
    }
    // KEYWORD SEARCH (title + content + tags)
    if (filters.keyword) {
        query.$or = [
            {
                [`translations.${languageCode}.title`]: {
                    $regex: filters.keyword,
                    $options: "i",
                },
            },
            {
                [`translations.${languageCode}.content`]: {
                    $regex: filters.keyword,
                    $options: "i",
                },
            },
            {
                [`translations.${languageCode}.tags`]: {
                    $elemMatch: {
                        $regex: filters.keyword,
                        $options: "i",
                    },
                },
            },
        ];
    }
    const result = yield (0, infinitePaginate_1.infinitePaginate)(news_model_1.default, query, skip, limit, []);
    // Transform response → return only selected language
    result.data = result.data.map((news) => {
        const translation = news.translations.get(languageCode) ||
            news.translations.get("en");
        const languages = Array.from(news.translations.keys());
        return {
            _id: news._id,
            imageUrl: news.imageUrl,
            category: news.category,
            likes: news.likes,
            likedBy: news.likedBy,
            views: news.views,
            languages,
            createdAt: news.createdAt,
            title: (translation === null || translation === void 0 ? void 0 : translation.title) || "",
            overview: (translation === null || translation === void 0 ? void 0 : translation.overview) || "",
            content: (translation === null || translation === void 0 ? void 0 : translation.content) || "",
            tags: (translation === null || translation === void 0 ? void 0 : translation.tags) || [],
            isTrending: news.isTrending || false,
        };
    });
    return result;
});
const getAllTrendingNews = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    const languageCode = filters.languageCode || "en";
    // 🔥 ONLY fetch trending news
    query.isTrending = true;
    // CATEGORY FILTER
    if (filters.category) {
        query.category = { $regex: `^${filters.category.trim()}$`, $options: "i" };
    }
    // KEYWORD SEARCH (title + content + tags)
    if (filters.keyword) {
        query.$or = [
            {
                [`translations.${languageCode}.title`]: {
                    $regex: filters.keyword,
                    $options: "i",
                },
            },
            {
                [`translations.${languageCode}.content`]: {
                    $regex: filters.keyword,
                    $options: "i",
                },
            },
            {
                [`translations.${languageCode}.tags`]: {
                    $elemMatch: {
                        $regex: filters.keyword,
                        $options: "i",
                    },
                },
            },
        ];
    }
    const result = yield (0, infinitePaginate_1.infinitePaginate)(news_model_1.default, query, skip, limit, []);
    // Transform response → return only selected language
    result.data = result.data.map((news) => {
        const translation = news.translations.get(languageCode) ||
            news.translations.get("en");
        const languages = Array.from(news.translations.keys());
        return {
            _id: news._id,
            imageUrl: news.imageUrl,
            category: news.category,
            likes: news.likes,
            likedBy: news.likedBy,
            views: news.views,
            languages,
            createdAt: news.createdAt,
            trendingAt: news.trendingAt,
            title: (translation === null || translation === void 0 ? void 0 : translation.title) || "",
            overview: (translation === null || translation === void 0 ? void 0 : translation.overview) || "",
            content: (translation === null || translation === void 0 ? void 0 : translation.content) || "",
            tags: (translation === null || translation === void 0 ? void 0 : translation.tags) || [],
            isTrending: true,
        };
    });
    return result;
});
const getSingleNewsById = (newsId_1, ...args_1) => __awaiter(void 0, [newsId_1, ...args_1], void 0, function* (newsId, languageCode = "en") {
    const result = yield news_model_1.default.findById(newsId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    const translation = result.translations.get(languageCode);
    if (!translation) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `Translation not available for this language.`);
    }
    const languages = Array.from(result.translations.keys());
    return {
        _id: result._id,
        imageUrl: result.imageUrl,
        category: result.category,
        likes: result.likes,
        likedBy: result.likedBy,
        views: result.views,
        languages,
        createdAt: result.createdAt,
        title: translation.title,
        overview: translation.overview,
        content: translation.content,
        tags: translation.tags,
        isTrending: result.isTrending
    };
});
const updateNews = (newsId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield news_model_1.default.findById(newsId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    let imageUrl;
    if (file) {
        const imageName = `${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (imageUrl && { imageUrl }));
    const result = yield news_model_1.default.findByIdAndUpdate(newsId, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteNews = (newsId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield news_model_1.default.findById(newsId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    return yield news_model_1.default.findByIdAndDelete(newsId);
});
const toggleLikeNews = (newsId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield news_model_1.default.findById(newsId);
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    const likedIndex = news.likedBy.findIndex((id) => id.toString() === userId);
    let updateOperation;
    if (likedIndex >= 0) {
        // User already liked -> unlike
        updateOperation = {
            $pull: { likedBy: userId },
            $inc: { likes: -1 }
        };
    }
    else {
        // User not liked -> like
        updateOperation = {
            $push: { likedBy: userId },
            $inc: { likes: 1 }
        };
    }
    const updatedNews = yield news_model_1.default.findByIdAndUpdate(newsId, updateOperation, { new: true, runValidators: false } // Disable validators for this operation
    );
    if (!updatedNews) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    return updatedNews;
});
const addNewsView = (newsId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield news_model_1.default.findById(newsId);
    if (!news)
        throw new Error("News not found");
    // Only increment if user hasn't viewed yet
    if (!news.viewedBy.includes(userId)) {
        news.viewedBy.push(userId);
        news.views += 1;
        yield news.save();
    }
    return news;
});
const toggleIsTrendingNews = (newsId) => __awaiter(void 0, void 0, void 0, function* () {
    const news = yield news_model_1.default.findById(newsId);
    if (!news) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "News not found");
    }
    // Toggle the isTrending field
    const newTrendingStatus = !news.isTrending;
    news.isTrending = newTrendingStatus;
    yield news.save();
    return {
        news,
        message: newTrendingStatus
            ? "News marked as trending successfully"
            : "News removed from trending successfully"
    };
});
exports.NewsServices = {
    addNews,
    getAllNews,
    getAllTrendingNews,
    getSingleNewsById,
    updateNews,
    deleteNews,
    toggleLikeNews,
    addNewsView,
    toggleIsTrendingNews
};
