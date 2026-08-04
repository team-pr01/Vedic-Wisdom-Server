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
exports.CoinPackageServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const coinPackage_model_1 = require("./coinPackage.model");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
// Add Coin Package
const addCoinPackage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coinPackage_model_1.CoinPackage.create(payload);
    return result;
});
// Get All Coin Packages
const getAllCoinPackages = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Filter by active status
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === "true";
    }
    // Filter by min amount
    if (filters.minAmount) {
        query.amount = { $gte: Number(filters.minAmount) };
    }
    // Filter by max amount
    if (filters.maxAmount) {
        query.amount = Object.assign(Object.assign({}, query.amount), { $lte: Number(filters.maxAmount) });
    }
    return (0, infinitePaginate_1.infinitePaginate)(coinPackage_model_1.CoinPackage, query, skip, limit, []);
});
// Get Single Coin Package
const getSingleCoinPackageById = (packageId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coinPackage_model_1.CoinPackage.findById(packageId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coin package not found");
    }
    return result;
});
// Update Coin Package
const updateCoinPackage = (packageId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield coinPackage_model_1.CoinPackage.findById(packageId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coin package not found");
    }
    const result = yield coinPackage_model_1.CoinPackage.findByIdAndUpdate(packageId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete Coin Package
const deleteCoinPackage = (packageId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield coinPackage_model_1.CoinPackage.findById(packageId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coin package not found");
    }
    return yield coinPackage_model_1.CoinPackage.findByIdAndDelete(packageId);
});
exports.CoinPackageServices = {
    addCoinPackage,
    getAllCoinPackages,
    getSingleCoinPackageById,
    updateCoinPackage,
    deleteCoinPackage,
};
