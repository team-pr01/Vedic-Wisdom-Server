/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import BookText from "./bookText.model";
import { TBookText } from "./bookText.interface";
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { Types } from "mongoose";

const createBookText = async (payload: TBookText) => {
  const result = await BookText.create(payload);
  return result;
};

const getAllBookTexts = async (keyword?: string) => {
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

  return await BookText.find(query).populate("bookId", "name type structure");
};

const getSingleBookText = async (bookTextId: string) => {
  const bookText = await BookText.findById(bookTextId).populate(
    "bookId",
    "name type structure"
  );

  if (!bookText) {
    throw new AppError(httpStatus.NOT_FOUND, "Book text not found");
  }

  return bookText;
};

const getBookTextByDetails = async (
  bookId: string,
  searchLevels: Record<string, string> // dynamic levels, e.g., { Chapter: "1", Verse: "2" }
): Promise<any> => {
  // Build dynamic $and query for all levels
  const locationQuery = Object.entries(searchLevels).map(
    ([levelName, value]) => ({
      location: { $elemMatch: { levelName, value } },
    })
  );

  const bookText = await BookText.findOne({
    bookId,
    $and: locationQuery,
  }).populate("bookId", "name type structure");

  if (!bookText) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Book text not found with given details"
    );
  }

  return bookText;
};

const getAllBookTextsByBookId = async (bookId: string) => {
  return await BookText.find({ bookId }).populate(
    "bookId",
    "name type structure"
  );
};

const filterBookTexts = async (
  bookId: string,
  filters: Record<string, string>
) => {
  const query: any = { bookId: new Types.ObjectId(bookId) };

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
  const allResults = await BookText.find(query);

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

      if (!levelA && !levelB) return 0;
      if (!levelA) return -1;
      if (!levelB) return 1;

      // Try numeric comparison first, then string comparison
      const numA = parseInt(levelA.value);
      const numB = parseInt(levelB.value);

      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
      } else {
        // String comparison
        const stringCompare = levelA.value.localeCompare(
          levelB.value,
          undefined,
          { numeric: true }
        );
        if (stringCompare !== 0) return stringCompare;
      }
    }
    return 0;
  });

  return sortedResults;
};

const updateTranslations = async (bookTextId: string, payload: any) => {
  // Fetch existing book text
  const existing = await BookText.findById(bookTextId);
  if (!existing)
    throw new AppError(httpStatus.NOT_FOUND, "Book text not found");

  // Make sure payload has translations array
  if (!payload.translations || !Array.isArray(payload.translations)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid translations format");
  }

  // Update translations directly
  const result = await BookText.findByIdAndUpdate(
    bookTextId,
    { translations: payload.translations },
    { new: true, runValidators: true }
  );

  if (!result)
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Book text not found after update"
    );

  return result;
};

const updateBookText = async (
  bookTextId: string,
  payload: Partial<TBookText>
) => {
  const existing = await BookText.findById(bookTextId);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Text not found");
  }

  const updatePayload: Partial<TBookText> = {
    ...payload,
  };

  const result = await BookText.findByIdAndUpdate(bookTextId, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteBookText = async (bookTextId: string) => {
  const result = await BookText.findByIdAndDelete(bookTextId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Book text not found");
  }

  return result;
};

export const BookTextService = {
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
