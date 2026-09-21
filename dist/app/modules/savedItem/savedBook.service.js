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
exports.SavedItemServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const books_model_1 = __importDefault(require("../book/books/books.model"));
const audioBook_model_1 = __importDefault(require("../audioBook/audioBook.model"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const savedBook_model_1 = require("./savedBook.model");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
// Get model based on item type
const getItemModel = (itemType) => {
    switch (itemType) {
        case "book":
            return books_model_1.default;
        case "audioBook":
            return audioBook_model_1.default;
        default:
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid item type");
    }
};
// Save an item (book or audioBook)
const saveItem = (userId, itemId, itemType) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if item exists
    const itemModel = getItemModel(itemType);
    const item = yield itemModel.findById(itemId);
    if (!item) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, `${itemType} not found`);
    }
    // Check if already saved
    const existing = yield savedBook_model_1.SavedItem.findOne({ userId, itemId, itemType });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Item already saved");
    }
    const savedItem = yield savedBook_model_1.SavedItem.create({
        userId,
        itemId,
        itemType,
    });
    return savedItem;
});
// Unsave an item
const unsaveItem = (userId, itemId, itemType) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield savedBook_model_1.SavedItem.findOneAndDelete({ userId, itemId, itemType });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Saved item not found");
    }
    return { message: "Item unsaved successfully" };
});
// Get all saved items of a user
const getMySavedItems = (userId_1, itemType_1, ...args_1) => __awaiter(void 0, [userId_1, itemType_1, ...args_1], void 0, function* (userId, itemType, skip = 0, limit = 10) {
    const query = { userId };
    if (itemType && itemType !== "") {
        query.itemType = itemType;
    }
    const result = yield (0, infinitePaginate_1.infinitePaginate)(savedBook_model_1.SavedItem, query, skip, limit, []);
    const savedItems = result.data.map((item) => item.toObject ? item.toObject() : item);
    // Group by itemType
    const books = savedItems.filter((item) => item.itemType === "book");
    const audioBooks = savedItems.filter((item) => item.itemType === "audioBook");
    // Populate books
    const bookIds = books.map((item) => item.itemId);
    const populatedBooks = yield books_model_1.default.find({ _id: { $in: bookIds } })
        .select("name type imageUrl")
        .lean();
    // Populate audioBooks
    const audioBookIds = audioBooks.map((item) => item.itemId);
    const populatedAudioBooks = yield audioBook_model_1.default.find({ _id: { $in: audioBookIds } })
        .select("name category isPremium thumbnailUrl")
        .lean();
    // Map populated data
    const mappedData = savedItems.map((item) => ({
        _id: item._id,
        userId: item.userId,
        itemId: item.itemId,
        itemType: item.itemType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        itemData: item.itemType === "book"
            ? populatedBooks.find((book) => book._id.toString() === item.itemId.toString())
            : populatedAudioBooks.find((audio) => audio._id.toString() === item.itemId.toString())
    }));
    return Object.assign(Object.assign({}, result), { data: mappedData });
});
// Get saved count for an item
const getSavedCount = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const savedBooksCount = yield savedBook_model_1.SavedItem.countDocuments({ userId, itemType: "book" });
    const savedAudioBooksCount = yield savedBook_model_1.SavedItem.countDocuments({ userId, itemType: "audioBook" });
    return {
        savedBooksCount,
        savedAudioBooksCount,
    };
});
exports.SavedItemServices = {
    saveItem,
    unsaveItem,
    getMySavedItems,
    getSavedCount,
};
