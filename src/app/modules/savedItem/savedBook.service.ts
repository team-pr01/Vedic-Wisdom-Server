/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Books from "../book/books/books.model";
import AudioBook from "../audioBook/audioBook.model";
import AppError from "../../errors/AppError";
import { SavedItem } from "./savedBook.model";
import { infinitePaginate } from "../../utils/infinitePaginate";

// Get model based on item type
const getItemModel = (itemType: string) => {
    switch (itemType) {
        case "book":
            return Books;
        case "audioBook":
            return AudioBook;
        default:
            throw new AppError(httpStatus.BAD_REQUEST, "Invalid item type");
    }
};

// Save an item (book or audioBook)
const saveItem = async (userId: string, itemId: string, itemType: string) => {
    // Check if item exists
    const itemModel = getItemModel(itemType);
    const item = await (itemModel as any).findById(itemId);
    if (!item) {
        throw new AppError(httpStatus.NOT_FOUND, `${itemType} not found`);
    }

    // Check if already saved
    const existing = await SavedItem.findOne({ userId, itemId, itemType });
    if (existing) {
        throw new AppError(httpStatus.BAD_REQUEST, "Item already saved");
    }

    const savedItem = await SavedItem.create({
        userId,
        itemId,
        itemType,
    });

    return savedItem;
};

// Unsave an item
const unsaveItem = async (userId: string, itemId: string, itemType: string) => {
    const result = await SavedItem.findOneAndDelete({ userId, itemId, itemType });
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Saved item not found");
    }
    return { message: "Item unsaved successfully" };
};

// Get all saved items of a user
const getMySavedItems = async (userId: string, itemType?: string, skip = 0, limit = 10) => {
    const query: any = { userId };
    if (itemType && itemType !== "") {
        query.itemType = itemType;
    }

    const result = await infinitePaginate(SavedItem, query, skip, limit, []);

    const savedItems = result.data.map((item: any) => item.toObject ? item.toObject() : item);

    // Group by itemType
    const books = savedItems.filter((item: any) => item.itemType === "book");
    const audioBooks = savedItems.filter((item: any) => item.itemType === "audioBook");

    // Populate books
    const bookIds = books.map((item: any) => item.itemId);
    const populatedBooks = await Books.find({ _id: { $in: bookIds } })
        .select("name type imageUrl")
        .lean();

    // Populate audioBooks
    const audioBookIds = audioBooks.map((item: any) => item.itemId);
    const populatedAudioBooks = await AudioBook.find({ _id: { $in: audioBookIds } })
        .select("name category isPremium thumbnailUrl")
        .lean();

    // Map populated data
    const mappedData = savedItems.map((item: any) => ({
        _id: item._id,
        userId: item.userId,
        itemId: item.itemId,
        itemType: item.itemType,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        itemData: item.itemType === "book"
            ? populatedBooks.find((book: any) => book._id.toString() === item.itemId.toString())
            : populatedAudioBooks.find((audio: any) => audio._id.toString() === item.itemId.toString())
    }));

    return {
        ...result,
        data: mappedData,
    };
};

// Get saved count for an item
const getSavedCount = async (userId: string) => {
    const savedBooksCount = await SavedItem.countDocuments({ userId, itemType: "book" });
    const savedAudioBooksCount = await SavedItem.countDocuments({ userId, itemType: "audioBook" });

    return {
        savedBooksCount,
        savedAudioBooksCount,
    };
};

export const SavedItemServices = {
    saveItem,
    unsaveItem,
    getMySavedItems,
    getSavedCount,
};