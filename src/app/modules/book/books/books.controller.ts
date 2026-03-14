import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { BooksService } from "./books.services";

// Create book
const createBook = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const result = await BooksService.createBook(req.body, file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Book created successfully",
    data: result,
  });
});

const getAllBooks = catchAsync(async (req: Request, res: Response) => {
  const { keyword } = req.query;

  const result = await BooksService.getAllBooks(keyword as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Books retrieved successfully",
    data: result,
  });
});


const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const result = await BooksService.getSingleBook(bookId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book retrieved successfully",
    data: result,
  });
});

const updateBook = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  const { bookId } = req.params;
  const result = await BooksService.updateBook(bookId, req.body, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book updated successfully",
    data: result,
  });
});

const deleteBook = catchAsync(async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const result = await BooksService.deleteBook(bookId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book deleted successfully",
    data: result,
  });
});

export const BooksController = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
};
