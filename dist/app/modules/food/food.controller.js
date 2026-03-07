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
exports.FoodController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const food_service_1 = require("./food.service");
/* ---------------- ADD FOOD ---------------- */
const addFood = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_service_1.FoodService.addFood(req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Food/Recipe added successfully",
        data: result,
    });
}));
/* ---------------- GET ALL (INFINITE SCROLL) ---------------- */
const getAllFoods = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        category: category,
    };
    const result = yield food_service_1.FoodService.getAllFoods(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Foods retrieved successfully",
        data: {
            foods: result.data,
            meta: result.meta,
        },
    });
}));
/* ---------------- GET SINGLE ---------------- */
const getSingleFood = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_service_1.FoodService.getSingleFood(req.params.foodId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Food retrieved successfully",
        data: result,
    });
}));
/* ---------------- UPDATE ---------------- */
const updateFood = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_service_1.FoodService.updateFood(req.params.foodId, req.user, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Food updated successfully",
        data: result,
    });
}));
/* ---------------- UPDATE ---------------- */
const deleteFood = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield food_service_1.FoodService.deleteFood(req.params.foodId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Food deleted successfully",
        data: result,
    });
}));
exports.FoodController = {
    addFood,
    getAllFoods,
    getSingleFood,
    updateFood,
    deleteFood,
};
