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
exports.CoinPackageControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const coinPackage_service_1 = require("./coinPackage.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
// Add Coin Package
const addCoinPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coinPackage_service_1.CoinPackageServices.addCoinPackage(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Coin package added successfully",
        data: result,
    });
}));
// Get All Coin Packages (Admin)
const getAllCoinPackages = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, isActive, minAmount, maxAmount, skip = "0", limit = "10" } = req.query;
    const filters = {
        keyword: keyword,
        isActive: isActive,
        minAmount: minAmount,
        maxAmount: maxAmount,
    };
    const result = yield coinPackage_service_1.CoinPackageServices.getAllCoinPackages(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Coin packages fetched successfully.",
        data: {
            packages: result.data,
            meta: result.meta,
        },
    });
}));
// Get Single Coin Package
const getSingleCoinPackageById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { packageId } = req.params;
    const result = yield coinPackage_service_1.CoinPackageServices.getSingleCoinPackageById(packageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Coin package fetched successfully.",
        data: result,
    });
}));
// Update Coin Package
const updateCoinPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { packageId } = req.params;
    const result = yield coinPackage_service_1.CoinPackageServices.updateCoinPackage(packageId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Coin package updated successfully",
        data: result,
    });
}));
// Delete Coin Package
const deleteCoinPackage = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { packageId } = req.params;
    const result = yield coinPackage_service_1.CoinPackageServices.deleteCoinPackage(packageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Coin package deleted successfully.",
        data: result,
    });
}));
exports.CoinPackageControllers = {
    addCoinPackage,
    getAllCoinPackages,
    getSingleCoinPackageById,
    updateCoinPackage,
    deleteCoinPackage,
};
