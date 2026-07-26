import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { SavedItemServices } from "./savedBook.service";
import sendResponse from "../../utils/sendResponse";

// Save an item
const saveItem = catchAsync(async (req, res) => {
    const { itemId, itemType } = req.body;
    const userId = req.user.userId;

    const result = await SavedItemServices.saveItem(userId, itemId, itemType);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: `${itemType} saved successfully`,
        data: result,
    });
});

// Unsave an item
const unsaveItem = catchAsync(async (req, res) => {
    const { itemId, itemType } = req.params;
    const userId = req.user.userId;

    const result = await SavedItemServices.unsaveItem(userId, itemId, itemType);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: `${itemType} unsaved successfully`,
        data: result,
    });
});

// Get all saved items
const getMySavedItems = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { itemType, skip = "0", limit = "10" } = req.query;

    const result = await SavedItemServices.getMySavedItems(
        userId,
        itemType as string,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Saved items fetched successfully",
        data: {
            savedItems: result.data,
            meta: result.meta,
        },
    });
});

// Get all saved items count
const getSavedCount = catchAsync(async (req, res) => {
    const userId = req.user.userId;
    const { itemType } = req.params;

    const result = await SavedItemServices.getSavedCount(
        userId,
        itemType as string,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Saved items fetched successfully",
        data: result,
    });
});

export const SavedItemControllers = {
    saveItem,
    unsaveItem,
    getMySavedItems,
    getSavedCount,
};