/* eslint-disable @typescript-eslint/no-explicit-any */
import Books from "./books.model";
import { TBooks } from "./books.interface";
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";

const createBook = async (
  payload: TBooks,
  file: Express.Multer.File | undefined
) => {
  let imageUrl = "";

  if (file) {
    const imageName = `Book-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const payloadData = {
    ...payload,
    imageUrl,
  };

  const result = await Books.create(payloadData);
  return result;
};

const getAllBooks = async (keyword?: string) => {
  let query = {};

  if (keyword) {
    const regex = new RegExp(keyword, "i");
    query = {
      $or: [
        { name: regex },
        { type: regex },
        { structure: regex },
      ],
    };
  }

  return await Books.find(query);
};


const getSingleBook = async (bookId: string) => {
  const book = await Books.findById(bookId);
  if (!book) {
    throw new AppError(httpStatus.NOT_FOUND, "Book not found");
  }
  return book;
};

const updateBook = async (
  bookId: string,
  payload: Partial<TBooks>,
  file: Express.Multer.File | undefined
) => {
  const existing = await Books.findById(bookId);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Book not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `Book-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const updatePayload: Partial<TBooks> = {
    ...payload,
    ...(imageUrl && { imageUrl }),
  };

  const result = await Books.findByIdAndUpdate(bookId, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

const deleteBook = async (bookId: string) => {
  const result = await Books.findByIdAndDelete(bookId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Book not found");
  }
  return result;
};

export const BooksService = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
};
