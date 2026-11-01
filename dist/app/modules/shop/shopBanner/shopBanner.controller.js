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
exports.ShopBannerControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const shopBanner_service_1 = require("./shopBanner.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
// Add Banner
const addBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield shopBanner_service_1.ShopBannerServices.addBanner(req.body, file);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Banner added successfully",
        data: result,
    });
}));
// Get All Banners
const getAllBanners = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield shopBanner_service_1.ShopBannerServices.getAllBanners(req.query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Banners fetched successfully",
        data: result,
    });
}));
// Delete Banner
const deleteBanner = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bannerId } = req.params;
    const result = yield shopBanner_service_1.ShopBannerServices.deleteBanner(bannerId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Banner deleted successfully",
        data: result,
    });
}));
// Update Banner Status
const updateBannerStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bannerId } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") {
        throw new Error("isActive must be a boolean value");
    }
    const result = yield shopBanner_service_1.ShopBannerServices.updateBannerStatus(bannerId, isActive);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: `Banner status updated to ${isActive ? "active" : "inactive"}`,
        data: result,
    });
}));
exports.ShopBannerControllers = {
    addBanner,
    getAllBanners,
    deleteBanner,
    updateBannerStatus,
};
