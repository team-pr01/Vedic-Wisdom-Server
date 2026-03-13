/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import AudioBook from "./audioBook.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import AppError from "../../errors/AppError";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";



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



/* GET ALL AUDIOBOOKS */

const getAllAudioBooks = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {

    const query: any = {};

    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }

    if (filters.isPremium !== undefined) {
        query.isPremium = filters.isPremium;
    }

    return infinitePaginate(AudioBook, query, skip, limit);
};



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

    await AudioBook.findByIdAndDelete(audioBookId);

    return true;
};



export const AudioBookServices = {
    addAudioBook,
    getAllAudioBooks,
    getSingleAudioBook,
    updateAudioBook,
    deleteAudioBook,
};