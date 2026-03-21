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
exports.BookTextService = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const bookText_model_1 = __importDefault(require("./bookText.model"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const mongoose_1 = require("mongoose");
const createBookText = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bookText_model_1.default.create(payload);
    return result;
});
const getAllBookTexts = (keyword) => __awaiter(void 0, void 0, void 0, function* () {
    let query = {};
    if (keyword) {
        const regex = new RegExp(keyword, "i");
        query = {
            $or: [
                { "location.chapter": regex },
                { "location.verse": regex },
                { originalText: regex },
                { primaryTranslation: regex },
                { tags: regex },
            ],
        };
    }
    return yield bookText_model_1.default.find(query).populate("bookId", "name type structure");
});
const getSingleBookText = (bookTextId) => __awaiter(void 0, void 0, void 0, function* () {
    const bookText = yield bookText_model_1.default.findById(bookTextId).populate("bookId", "name type structure");
    if (!bookText) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found");
    }
    return bookText;
});
const getBookTextByDetails = (bookId, searchLevels // dynamic levels, e.g., { Chapter: "1", Verse: "2" }
) => __awaiter(void 0, void 0, void 0, function* () {
    // Build dynamic $and query for all levels
    const locationQuery = Object.entries(searchLevels).map(([levelName, value]) => ({
        location: { $elemMatch: { levelName, value } },
    }));
    const bookText = yield bookText_model_1.default.findOne({
        bookId,
        $and: locationQuery,
    }).populate("bookId", "name type structure");
    if (!bookText) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found with given details");
    }
    return bookText;
});
const getAllBookTextsByBookId = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bookText_model_1.default.find({ bookId }).populate("bookId", "name type structure");
});
const filterBookTexts = (bookId, filters) => __awaiter(void 0, void 0, void 0, function* () {
    const query = { bookId: new mongoose_1.Types.ObjectId(bookId) };
    if (filters && Object.keys(filters).length > 0) {
        // Build filter conditions for each level
        query.$and = Object.entries(filters).map(([levelName, value]) => ({
            location: {
                $elemMatch: {
                    levelName: new RegExp(`^${levelName}$`, "i"),
                    value: new RegExp(`^${value}$`, "i"),
                },
            },
        }));
    }
    // Get all book texts first to understand the structure
    const allResults = yield bookText_model_1.default.find(query);
    // If no results, return empty array
    if (allResults.length === 0) {
        return [];
    }
    // Analyze the location structure from the first document
    const sampleLocation = allResults[0].location;
    const levelOrder = sampleLocation.map((item) => item.levelName);
    // Sort results based on the actual location structure
    const sortedResults = allResults.sort((a, b) => {
        for (let i = 0; i < Math.max(a.location.length, b.location.length); i++) {
            const levelA = a.location[i];
            const levelB = b.location[i];
            if (!levelA && !levelB)
                return 0;
            if (!levelA)
                return -1;
            if (!levelB)
                return 1;
            // Try numeric comparison first, then string comparison
            const numA = parseInt(levelA.value);
            const numB = parseInt(levelB.value);
            if (!isNaN(numA) && !isNaN(numB)) {
                if (numA !== numB)
                    return numA - numB;
            }
            else {
                // String comparison
                const stringCompare = levelA.value.localeCompare(levelB.value, undefined, { numeric: true });
                if (stringCompare !== 0)
                    return stringCompare;
            }
        }
        return 0;
    });
    return sortedResults;
});
const updateTranslations = (bookTextId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Fetch existing book text
    const existing = yield bookText_model_1.default.findById(bookTextId);
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found");
    // Make sure payload has translations array
    if (!payload.translations || !Array.isArray(payload.translations)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid translations format");
    }
    // Update translations directly
    const result = yield bookText_model_1.default.findByIdAndUpdate(bookTextId, { translations: payload.translations }, { new: true, runValidators: true });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found after update");
    return result;
});
const updateBookText = (bookTextId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield bookText_model_1.default.findById(bookTextId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Text not found");
    }
    const updatePayload = Object.assign({}, payload);
    const result = yield bookText_model_1.default.findByIdAndUpdate(bookTextId, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteBookText = (bookTextId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bookText_model_1.default.findByIdAndDelete(bookTextId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found");
    }
    return result;
});
exports.BookTextService = {
    createBookText,
    getAllBookTexts,
    getSingleBookText,
    getBookTextByDetails,
    getAllBookTextsByBookId,
    filterBookTexts,
    updateBookText,
    updateTranslations,
    deleteBookText,
};
