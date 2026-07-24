/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import AudioBook from "./audioBook.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import AppError from "../../errors/AppError";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";
import AudioTrack from "./audioTrack/audioTrack.model";

/* ADD AUDIOBOOK */
const addAudioBook = async (
    payload: any,
    file?: Express.Multer.File
) => {

    let thumbnailUrl = "";

    if (file) {
        const { secure_url } = await sendImageToCloudinary(
            `audiobook-thumb-${Date.now()}`,
            file.path
        );

        thumbnailUrl = secure_url;
    }

    const audioBook = await AudioBook.create({
        ...payload,
        thumbnailUrl,
    });

    return audioBook;
};

/* GET ALL AUDIOBOOKS (Excluding New Arrivals & Most Popular) */
const getAllAudioBooks = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {};

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

    return infinitePaginate(AudioBook, query, skip, limit);
};

/* GET NEW ARRIVALS - Books added in the last 15 days */
const getNewArrivals = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const fifteenDaysAgo = new Date();
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

    const query: any = {
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
    return infinitePaginate(AudioBook, query, skip, limit, []);
};

/* GET MOST POPULAR AUDIOBOOKS - Based on soldCount */
const getMostPopularAudioBooks = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {
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
    return infinitePaginate(AudioBook, query, skip, limit, []);
};

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
const getSingleAudioBook = async (audioBookId: string) => {

    const book = await AudioBook.findById(audioBookId);

    if (!book) {
        throw new AppError(httpStatus.NOT_FOUND, "AudioBook not found");
    }

    return book;
};

/* UPDATE AUDIOBOOK */
const updateAudioBook = async (
    audioBookId: string,
    payload: any,
    file?: Express.Multer.File
) => {

    const book = await AudioBook.findById(audioBookId);

    if (!book) {
        throw new AppError(httpStatus.NOT_FOUND, "AudioBook not found");
    }

    let thumbnailUrl = book.thumbnailUrl;

    if (file) {

        if (book.thumbnailUrl) {
            const publicId = extractPublicId(book.thumbnailUrl);
            await deleteImageFromCloudinary(publicId);
        }

        const { secure_url } = await sendImageToCloudinary(
            `audiobook-thumb-${Date.now()}`,
            file.path
        );

        thumbnailUrl = secure_url;
    }

    const updatedBook = await AudioBook.findByIdAndUpdate(
        audioBookId,
        {
            ...payload,
            thumbnailUrl,
        },
        { new: true }
    );

    return updatedBook;
};

/* DELETE AUDIOBOOK */
const deleteAudioBook = async (audioBookId: string) => {

    const book = await AudioBook.findById(audioBookId);

    if (!book) {
        throw new AppError(httpStatus.NOT_FOUND, "AudioBook not found");
    }

    if (book.thumbnailUrl) {
        const publicId = extractPublicId(book.thumbnailUrl);
        await deleteImageFromCloudinary(publicId);
    }

    await AudioTrack.deleteMany({ audioBookId });

    await AudioBook.findByIdAndDelete(audioBookId);

    return true;
};


export const AudioBookServices = {
    addAudioBook,
    getAllAudioBooks,
    getNewArrivals,
    getMostPopularAudioBooks,
    getSingleAudioBook,
    updateAudioBook,
    deleteAudioBook,
};