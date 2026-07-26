import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AudioBookPurchaseServices } from "./audioBookPurchase.service";

// Purchase an audio book
const purchaseAudioBook = catchAsync(async (req, res) => {
  const { audioBookId } = req.body;
  const userId = req.user.userId;

  const result = await AudioBookPurchaseServices.purchaseAudioBook(
    userId,
    audioBookId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Audio book purchased successfully",
    data: result,
  });
});

// Get my purchased audio books
const getMyPurchasedAudioBooks = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { skip = "0", limit = "10" } = req.query;

  const result = await AudioBookPurchaseServices.getMyPurchasedAudioBooks(
    userId,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My audio books fetched successfully",
    data: {
      purchases: result.data,
      meta: result.meta,
    },
  });
});

// Get all purchases (Admin only)
const getAllPurchases = catchAsync(async (req, res) => {
  const { userId, audioBookId, skip = "0", limit = "10" } = req.query;

  const filters = {
    userId: userId as string,
    audioBookId: audioBookId as string,
  };

  const result = await AudioBookPurchaseServices.getAllPurchases(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All purchases fetched successfully",
    data: {
      purchases: result.data,
      meta: result.meta,
    },
  });
});

// Get single purchase by ID
const getPurchaseById = catchAsync(async (req, res) => {
  const { purchaseId } = req.params;

  const result = await AudioBookPurchaseServices.getPurchaseById(purchaseId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Purchase fetched successfully",
    data: result,
  });
});

export const AudioBookPurchaseControllers = {
  purchaseAudioBook,
  getMyPurchasedAudioBooks,
  getAllPurchases,
  getPurchaseById,
};