/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { Food } from "./food.model";
import { infinitePaginate } from "../../utils/infinitePaginate";

/* ---------------- ADD FOOD ---------------- */
const addFood = async (payload: any) => {
    const response = await Food.create(payload);
    return response;
};

/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
const getAllFoods = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {};

    // 🔥 TEXT SEARCH (indexed)
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }

    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }

    return infinitePaginate(
        Food,
        query,
        skip,
        limit,
        [
            { path: "category", select: "name" },
        ]
    );
};

/* ---------------- GET SINGLE ---------------- */
const getSingleFood = async (foodId: string) => {
    const food = await Food.findById(foodId)
        .populate("category", "name")

    if (!food) {
        throw new AppError(httpStatus.NOT_FOUND, "Food not found");
    }

    return food;
};

/* ---------------- UPDATE ---------------- */
const updateFood = async (
    foodId: string,
    user: any,
    payload: any
) => {
    const food = await Food.findById(foodId);

    if (!food) {
        throw new AppError(httpStatus.NOT_FOUND, "Food not found");
    }

    return Food.findByIdAndUpdate(foodId, payload, {
        new: true,
        runValidators: true,
    });
};

/* ---------------- DELETE ---------------- */
const deleteFood = async (foodId: string) => {
    const food = await Food.findById(foodId);

    if (!food) {
        throw new AppError(httpStatus.NOT_FOUND, "Food not found");
    }
    return Food.findByIdAndDelete(foodId);
};

export const FoodService = {
    addFood,
    getAllFoods,
    getSingleFood,
    updateFood,
    deleteFood,
};