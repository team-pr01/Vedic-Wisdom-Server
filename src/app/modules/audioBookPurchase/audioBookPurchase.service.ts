/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import AudioBook from "../../modules/audioBook/audioBook.model";
import { User } from "../../modules/auth/auth.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { AudioBookPurchase } from "./audioBookPurchase.model";

// Purchase an audio book
const purchaseAudioBook = async (userId: string, audioBookId: string) => {
    // Check if audio book exists
    const audioBook = await AudioBook.findById(audioBookId);
    if (!audioBook) {
        throw new AppError(httpStatus.NOT_FOUND, "Audio book not found");
    }

    // Check if already purchased
    const existing = await AudioBookPurchase.findOne({
        userId,
        audioBookId,
    });
    if (existing) {
        throw new AppError(httpStatus.BAD_REQUEST, "This book is already in your library.");
    }

    // Check if premium and get price
    let priceInCoins = 0;
    if (audioBook.isPremium) {
        priceInCoins = audioBook.coinPrice || 0;

        if (priceInCoins <= 0) {
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid price");
        }

        // Check user's coin balance
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError(httpStatus.NOT_FOUND, "User not found");
        }

        if ((user.coins || 0) < priceInCoins) {
            throw new AppError(httpStatus.BAD_REQUEST, "You don't have sufficient coins to buy this book.");
        }

        // Deduct coins
        user.coins = (user.coins || 0) - priceInCoins;
        await user.save();
    }

    // Create purchase record
    const purchase = await AudioBookPurchase.create({
        userId,
        audioBookId,
        coinPrice: priceInCoins,
    });

    // Increment sold count
    audioBook.soldCount = (audioBook.soldCount || 0) + 1;
    await audioBook.save();

    return purchase;
};

// Get user's purchased audio books
const getMyPurchasedAudioBooks = async (userId: string, skip = 0, limit = 10) => {
    const query = { userId };

    const result = await infinitePaginate(AudioBookPurchase, query, skip, limit, [
        {
            path: "audioBookId",
            select: "name thumbnailUrl category description",
        },
    ]);

    return result;
};

// Get all purchases (Admin)
const getAllPurchases = async (filters: any = {}, skip = 0, limit = 10) => {
    const query: any = {};

    if (filters.userId) {
        query.userId = filters.userId;
    }

    if (filters.audioBookId) {
        query.audioBookId = filters.audioBookId;
    }

    return infinitePaginate(AudioBookPurchase, query, skip, limit, [
        { path: "userId", select: "name email" },
        { path: "audioBookId", select: "name thumbnailUrl" },
    ]);
};

// Get single purchase by ID
const getPurchaseById = async (purchaseId: string) => {
    const result = await AudioBookPurchase.findById(purchaseId)
        .populate("userId", "name email")
        .populate("audioBookId", "name thumbnailUrl description");

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Purchase not found");
    }

    return result;
};

export const AudioBookPurchaseServices = {
    purchaseAudioBook,
    getMyPurchasedAudioBooks,
    getAllPurchases,
    getPurchaseById,
};