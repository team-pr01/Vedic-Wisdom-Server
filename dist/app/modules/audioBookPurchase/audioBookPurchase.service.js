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
exports.AudioBookPurchaseServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const audioBook_model_1 = __importDefault(require("../../modules/audioBook/audioBook.model"));
const auth_model_1 = require("../../modules/auth/auth.model");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const audioBookPurchase_model_1 = require("./audioBookPurchase.model");
// Purchase an audio book
const purchaseAudioBook = (userId, audioBookId) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if audio book exists
    const audioBook = yield audioBook_model_1.default.findById(audioBookId);
    if (!audioBook) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Audio book not found");
    }
    // Check if already purchased
    const existing = yield audioBookPurchase_model_1.AudioBookPurchase.findOne({
        userId,
        audioBookId,
    });
    if (existing) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This book is already in your library.");
    }
    // Check if premium and get price
    let priceInCoins = 0;
    if (audioBook.isPremium) {
        priceInCoins = audioBook.coinPrice || 0;
        if (priceInCoins <= 0) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid price");
        }
        // Check user's coin balance
        const user = yield auth_model_1.User.findById(userId);
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
        }
        if ((user.coins || 0) < priceInCoins) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You don't have sufficient coins to buy this book.");
        }
        // Deduct coins
        user.coins = (user.coins || 0) - priceInCoins;
        yield user.save();
    }
    // Create purchase record
    const purchase = yield audioBookPurchase_model_1.AudioBookPurchase.create({
        userId,
        audioBookId,
        coinPrice: priceInCoins,
    });
    // Increment sold count
    audioBook.soldCount = (audioBook.soldCount || 0) + 1;
    yield audioBook.save();
    return purchase;
});
// Get user's purchased audio books
const getMyPurchasedAudioBooks = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const query = { userId };
    const result = yield (0, infinitePaginate_1.infinitePaginate)(audioBookPurchase_model_1.AudioBookPurchase, query, skip, limit, [
        {
            path: "audioBookId",
            select: "name thumbnailUrl category description coinPrice",
        },
    ]);
    return result;
});
// Get all purchases (Admin)
const getAllPurchases = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.userId) {
        query.userId = filters.userId;
    }
    if (filters.audioBookId) {
        query.audioBookId = filters.audioBookId;
    }
    return (0, infinitePaginate_1.infinitePaginate)(audioBookPurchase_model_1.AudioBookPurchase, query, skip, limit, [
        { path: "userId", select: "name email" },
        { path: "audioBookId", select: "name thumbnailUrl" },
    ]);
});
// Get single purchase by ID
const getPurchaseById = (purchaseId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield audioBookPurchase_model_1.AudioBookPurchase.findById(purchaseId)
        .populate("userId", "name email")
        .populate("audioBookId", "name thumbnailUrl description");
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Purchase not found");
    }
    return result;
});
const checkOwnership = (userId, audioBookId) => __awaiter(void 0, void 0, void 0, function* () {
    const purchase = yield audioBookPurchase_model_1.AudioBookPurchase.findOne({ userId, audioBookId });
    return !!purchase;
});
exports.AudioBookPurchaseServices = {
    purchaseAudioBook,
    getMyPurchasedAudioBooks,
    getAllPurchases,
    getPurchaseById,
    checkOwnership
};
