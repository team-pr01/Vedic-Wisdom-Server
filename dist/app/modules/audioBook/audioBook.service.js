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
exports.AudioBookServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const audioBook_model_1 = __importDefault(require("./audioBook.model"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const deleteImageFromCloudinary_1 = require("../../utils/deleteImageFromCloudinary");
const audioTrack_model_1 = __importDefault(require("./audioTrack/audioTrack.model"));
/* ADD AUDIOBOOK */
const addAudioBook = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let thumbnailUrl = "";
    if (file) {
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`audiobook-thumb-${Date.now()}`, file.path);
        thumbnailUrl = secure_url;
    }
    const audioBook = yield audioBook_model_1.default.create(Object.assign(Object.assign({}, payload), { thumbnailUrl }));
    return audioBook;
});
/* GET ALL AUDIOBOOKS (Excluding New Arrivals & Most Popular) */
const getAllAudioBooks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // Exclude books that are in "new arrivals" (last 15 days)
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    // Exclude new arrivals (created within last 15 days)
    query.$and = [
        { createdAt: { $lt: fifteenDaysAgo } }, // Not new arrival
        {
            $or: [
                { soldCount: { $eq: 0 } } // Or soldCount is 0
            ]
        }
    ];
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Premium filter
    if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
    }
    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }
    return (0, infinitePaginate_1.infinitePaginate)(audioBook_model_1.default, query, skip, limit);
});
/* GET NEW ARRIVALS - Books added in the last 15 days */
const getNewArrivals = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const query = {
        createdAt: { $gte: fifteenDaysAgo }, // Only books from last 15 days
    };
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Premium filter
    if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
    }
    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }
    // Sort by newest first
    return (0, infinitePaginate_1.infinitePaginate)(audioBook_model_1.default, query, skip, limit, []);
});
/* GET MOST POPULAR AUDIOBOOKS - Based on soldCount */
const getMostPopularAudioBooks = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {
        soldCount: { $gt: 0 }, // Only books with at least 1 sale
    };
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Premium filter
    if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
    }
    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }
    // Sort by soldCount descending (most sold first)
    return (0, infinitePaginate_1.infinitePaginate)(audioBook_model_1.default, query, skip, limit, []);
});
/* GET RECOMMENDED AUDIOBOOKS - Based on user's purchase history or preferences */
// const getRecommendedAudioBooks = async (
//     userId: string,
//     filters: any = {},
//     skip = 0,
//     limit = 10
// ) => {
//     const user = await User.findById(userId).populate('purchasedBooks');
//     if (!user) {
//         throw new AppError(httpStatus.NOT_FOUND, "User not found");
//     }
//     const purchasedCategories = user.purchasedBooks?.map(
//         (book: any) => book.category
//     ) || [];
//     const purchasedAuthors = user.purchasedBooks?.map(
//         (book: any) => book.author
//     ) || [];
//     const query: any = {
//         $or: [
//             { category: { $in: purchasedCategories } },
//             { author: { $in: purchasedAuthors } },
//         ],
//         _id: { $nin: user.purchasedBooks?.map((b: any) => b._id) || [] }, 
//     };
//     if (filters.keyword) {
//         query.$text = { $search: filters.keyword };
//     }
//     if (filters.isPremium !== undefined) {
//         query.isPremium = filters.isPremium;
//     }
//     return infinitePaginate(AudioBook, query, skip, limit, []);
// };
/* GET SINGLE AUDIOBOOK */
const getSingleAudioBook = (audioBookId) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield audioBook_model_1.default.findById(audioBookId);
    if (!book) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "AudioBook not found");
    }
    return book;
});
/* UPDATE AUDIOBOOK */
const updateAudioBook = (audioBookId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield audioBook_model_1.default.findById(audioBookId);
    if (!book) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "AudioBook not found");
    }
    let thumbnailUrl = book.thumbnailUrl;
    if (file) {
        if (book.thumbnailUrl) {
            const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(book.thumbnailUrl);
            yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
        }
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`audiobook-thumb-${Date.now()}`, file.path);
        thumbnailUrl = secure_url;
    }
    const updatedBook = yield audioBook_model_1.default.findByIdAndUpdate(audioBookId, Object.assign(Object.assign({}, payload), { thumbnailUrl }), { new: true });
    return updatedBook;
});
/* DELETE AUDIOBOOK */
const deleteAudioBook = (audioBookId) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield audioBook_model_1.default.findById(audioBookId);
    if (!book) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "AudioBook not found");
    }
    if (book.thumbnailUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(book.thumbnailUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    yield audioTrack_model_1.default.deleteMany({ audioBookId });
    yield audioBook_model_1.default.findByIdAndDelete(audioBookId);
    return true;
});
exports.AudioBookServices = {
    addAudioBook,
    getAllAudioBooks,
    getNewArrivals,
    getMostPopularAudioBooks,
    getSingleAudioBook,
    updateAudioBook,
    deleteAudioBook,
};
