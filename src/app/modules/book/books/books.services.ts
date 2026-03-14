/* eslint-disable @typescript-eslint/no-explicit-any */
import Books from "./books.model";
import { TBooks } from "./books.interface";
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../../utils/deleteImageFromCloudinary";

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

const getAllBooks = async (
  keyword?: string,
  skip = 0,
  limit = 10
) => {

  const query: any = {};

  if (keyword) {
    query.$text = { $search: keyword };
  }

  return infinitePaginate(Books, query, skip, limit);
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

  let imageUrl: string | undefined = existing.imageUrl;

  /* ---------- REPLACE IMAGE ---------- */

  if (file) {
    // delete old image
    if (existing.imageUrl) {
      const publicId = extractPublicId(existing.imageUrl);
      await deleteImageFromCloudinary(publicId);
    }

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
  const existing = await Books.findById(bookId);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Book not found");
  }

  /* ---------- DELETE IMAGE FROM CLOUDINARY ---------- */
  if (existing.imageUrl) {
    const publicId = extractPublicId(existing.imageUrl);
    await deleteImageFromCloudinary(publicId);
  }

  await Books.findByIdAndDelete(bookId);

  return {};
};

export const BooksService = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
};
