"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FoodService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const food_model_1 = require("./food.model");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
/* ---------------- ADD FOOD ---------------- */
const addFood = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield food_model_1.Food.create(payload);
    return response;
});
/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
const getAllFoods = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // 🔥 TEXT SEARCH (indexed)
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Category filter
    if (filters.category) {
        query.category = filters.category;
    }
    return (0, infinitePaginate_1.infinitePaginate)(food_model_1.Food, query, skip, limit, [
        { path: "category", select: "name" },
    ]);
});
/* ---------------- GET SINGLE ---------------- */
const getSingleFood = (foodId) => __awaiter(void 0, void 0, void 0, function* () {
    const food = yield food_model_1.Food.findById(foodId)
        .populate("category", "name");
    if (!food) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Food not found");
    }
    return food;
});
/* ---------------- UPDATE ---------------- */
const updateFood = (foodId, user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const food = yield food_model_1.Food.findById(foodId);
    if (!food) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Food not found");
    }
    return food_model_1.Food.findByIdAndUpdate(foodId, payload, {
        new: true,
        runValidators: true,
    });
});
/* ---------------- DELETE ---------------- */
const deleteFood = (foodId) => __awaiter(void 0, void 0, void 0, function* () {
    const food = yield food_model_1.Food.findById(foodId);
    if (!food) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Food not found");
    }
    return food_model_1.Food.findByIdAndDelete(foodId);
});
exports.FoodService = {
    addFood,
    getAllFoods,
    getSingleFood,
    updateFood,
    deleteFood,
};
