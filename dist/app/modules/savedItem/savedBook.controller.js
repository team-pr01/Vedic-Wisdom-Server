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
exports.SavedItemControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const savedBook_service_1 = require("./savedBook.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
// Save an item
const saveItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, itemType } = req.body;
    const userId = req.user.userId;
    const result = yield savedBook_service_1.SavedItemServices.saveItem(userId, itemId, itemType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: `${itemType} saved successfully`,
        data: result,
    });
}));
// Unsave an item
const unsaveItem = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { itemId, itemType } = req.params;
    const userId = req.user.userId;
    const result = yield savedBook_service_1.SavedItemServices.unsaveItem(userId, itemId, itemType);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `${itemType} unsaved successfully`,
        data: result,
    });
}));
// Get all saved items
const getMySavedItems = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { itemType, skip = "0", limit = "10" } = req.query;
    const result = yield savedBook_service_1.SavedItemServices.getMySavedItems(userId, itemType, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Saved items fetched successfully",
        data: {
            savedItems: result.data,
            meta: result.meta,
        },
    });
}));
// Get all saved items count
const getSavedCount = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const result = yield savedBook_service_1.SavedItemServices.getSavedCount(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Saved items fetched successfully",
        data: result,
    });
}));
exports.SavedItemControllers = {
    saveItem,
    unsaveItem,
    getMySavedItems,
    getSavedCount,
};
