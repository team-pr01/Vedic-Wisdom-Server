import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FoodService } from "./food.service";

/* ---------------- ADD FOOD ---------------- */
const addFood = catchAsync(async (req, res) => {
    const result = await FoodService.addFood(req.user, req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Food/Recipe added successfully",
        data: result,
    });
});

/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
const getAllFoods = catchAsync(async (req, res) => {
    const {
        keyword,
        category,
        skip = "0",
        limit = "10",
    } = req.query;

    const filters = {
        keyword: keyword as string,
        category: category as string,
    };

    const result = await FoodService.getAllFoods(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Foods retrieved successfully",
        data: {
            foods: result.data,
            meta: result.meta,
        },
    });
});

/* ---------------- GET SINGLE ---------------- */
const getSingleFood = catchAsync(async (req, res) => {
    const result = await FoodService.getSingleFood(req.params.foodId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Food retrieved successfully",
        data: result,
    });
});

/* ---------------- UPDATE ---------------- */
const updateFood = catchAsync(async (req, res) => {
    const result = await FoodService.updateFood(
        req.params.foodId,
        req.user,
        req.body
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Food updated successfully",
        data: result,
    });
});

/* ---------------- UPDATE ---------------- */
const deleteFood = catchAsync(async (req, res) => {
    const result = await FoodService.deleteFood(req.params.foodId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Food deleted successfully",
        data: result,
    });
});

export const FoodController = {
    addFood,
    getAllFoods,
    getSingleFood,
    updateFood,
    deleteFood,
};