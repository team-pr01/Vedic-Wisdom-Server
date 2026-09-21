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
exports.AudioBookPurchaseControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const audioBookPurchase_service_1 = require("./audioBookPurchase.service");
// Purchase an audio book
const purchaseAudioBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { audioBookId } = req.body;
    const userId = req.user.userId;
    const result = yield audioBookPurchase_service_1.AudioBookPurchaseServices.purchaseAudioBook(userId, audioBookId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Audio book purchased successfully",
        data: result,
    });
}));
// Get my purchased audio books
const getMyPurchasedAudioBooks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const { skip = "0", limit = "10" } = req.query;
    const result = yield audioBookPurchase_service_1.AudioBookPurchaseServices.getMyPurchasedAudioBooks(userId, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My audio books fetched successfully",
        data: {
            purchases: result.data,
            meta: result.meta,
        },
    });
}));
// Get all purchases (Admin only)
const getAllPurchases = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, audioBookId, skip = "0", limit = "10" } = req.query;
    const filters = {
        userId: userId,
        audioBookId: audioBookId,
    };
    const result = yield audioBookPurchase_service_1.AudioBookPurchaseServices.getAllPurchases(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All purchases fetched successfully",
        data: {
            purchases: result.data,
            meta: result.meta,
        },
    });
}));
// Get single purchase by ID
const getPurchaseById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { purchaseId } = req.params;
    const result = yield audioBookPurchase_service_1.AudioBookPurchaseServices.getPurchaseById(purchaseId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Purchase fetched successfully",
        data: result,
    });
}));
// Check if user owns an audio book
const checkOwnership = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { audioBookId } = req.params;
    const userId = req.user.userId;
    const hasPurchased = yield audioBookPurchase_service_1.AudioBookPurchaseServices.checkOwnership(userId, audioBookId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        data: { hasPurchased },
    });
}));
exports.AudioBookPurchaseControllers = {
    purchaseAudioBook,
    getMyPurchasedAudioBooks,
    getAllPurchases,
    getPurchaseById,
    checkOwnership,
};
