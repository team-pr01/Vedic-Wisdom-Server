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
exports.ShopBannerServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const shopBanner_model_1 = require("./shopBanner.model");
const deleteImageFromCloudinary_1 = require("../../../utils/deleteImageFromCloudinary");
// Add Banner
const addBanner = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Banner image is required");
    }
    // Upload to Cloudinary
    const imageName = `shop-banner-${Date.now()}`;
    const path = file.path;
    const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
    const payloadData = Object.assign(Object.assign({}, payload), { imageUrl: secure_url });
    const result = yield shopBanner_model_1.ShopBanner.create(payloadData);
    return result;
});
// Get All Banners (No Pagination)
const getAllBanners = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}) {
    const query = { isActive: true };
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === "true" || filters.isActive === true;
    }
    const result = yield shopBanner_model_1.ShopBanner.find(query).sort({ createdAt: -1 });
    return result;
});
// Delete Banner
const deleteBanner = (bannerId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield shopBanner_model_1.ShopBanner.findById(bannerId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    // Delete image from Cloudinary
    if (existing.imageUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(existing.imageUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    return yield shopBanner_model_1.ShopBanner.findByIdAndDelete(bannerId);
});
// Update Banner Status (Toggle)
const updateBannerStatus = (bannerId, isActive) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield shopBanner_model_1.ShopBanner.findById(bannerId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    const result = yield shopBanner_model_1.ShopBanner.findByIdAndUpdate(bannerId, { isActive }, { new: true, runValidators: true });
    return result;
});
exports.ShopBannerServices = {
    addBanner,
    getAllBanners,
    deleteBanner,
    updateBannerStatus,
};
