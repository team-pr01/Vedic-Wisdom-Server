import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { BookTextService } from "./bookText.services";
import AppError from "../../../errors/AppError";

const createBookText = catchAsync(async (req: Request, res: Response) => {
  const result = await BookTextService.createBookText(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Book text created successfully",
    data: result,
  });
});

const getAllBookTexts = catchAsync(async (req: Request, res: Response) => {
  const { keyword } = req.query;

  const result = await BookTextService.getAllBookTexts(keyword as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book texts retrieved successfully",
    data: result,
  });
});

const getSingleBookText = catchAsync(async (req: Request, res: Response) => {
  const { bookTextId } = req.params;
  const result = await BookTextService.getSingleBookText(bookTextId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book text retrieved successfully",
    data: result,
  });
});

const getBookTextByDetails = catchAsync(async (req: Request, res: Response) => {
  const { bookId, ...levels } = req.query;

  if (!bookId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Book ID is required");
  }

  // Convert query params to Record<string, string>
  const searchLevels: Record<string, string> = {};
  Object.keys(levels).forEach((key) => {
    const value = levels[key];
    if (typeof value === "string") searchLevels[key] = value;
  });

  const result = await BookTextService.getBookTextByDetails(
    bookId as string,
    searchLevels
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book text fetched successfully",
    data: result,
  });
});

const getAllBookTextsByBookId = catchAsync(
  async (req: Request, res: Response) => {
    const { bookId } = req.params;

    const result = await BookTextService.getAllBookTextsByBookId(bookId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Book texts retrieved successfully by bookId",
      data: result,
    });
  }
);
const filterBookTexts = catchAsync(async (req: Request, res: Response) => {
  const { bookId, ...filters } = req.query;

  const result = await BookTextService.filterBookTexts(
    bookId as string,
    filters as Record<string, string>
  );

  res.status(200).json({
    success: true,
    message: "Filtered BookTexts fetched successfully",
    data: result,
  });
});

const updateBookText = catchAsync(async (req: Request, res: Response) => {
  const { bookTextId } = req.params;
  const result = await BookTextService.updateBookText(bookTextId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Text updated successfully",
    data: result,
  });
});

const updateTranslations = catchAsync(async (req: Request, res: Response) => {
  const { bookTextId } = req.params;
  const result = await BookTextService.updateBookText(bookTextId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book text updated successfully",
    data: result,
  });
});

const deleteBookText = catchAsync(async (req: Request, res: Response) => {
  const { bookTextId } = req.params;
  const result = await BookTextService.deleteBookText(bookTextId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book text deleted successfully",
    data: result,
  });
});

export const BookTextController = {
  createBookText,
  getAllBookTexts,
  getSingleBookText,
  getBookTextByDetails,
  getAllBookTextsByBookId,
  updateBookText,
  updateTranslations,
  deleteBookText,
  filterBookTexts,
};
