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
exports.VendorServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const vendor_model_1 = __importDefault(require("./vendor.model"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const product_model_1 = __importDefault(require("../product/product.model"));
const applyVendor = (user, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const exists = yield vendor_model_1.default.findOne({ userId: user.userId });
    if (exists) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already applied");
    }
    let documentUrls = [];
    if (!files.length) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Please upload your NID or Business Trade License");
    }
    if (files.length) {
        const uploads = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`vendor-doc-${Date.now()}-${index}`, file.path);
            return secure_url;
        }));
        documentUrls = yield Promise.all(uploads);
    }
    const vendorData = Object.assign(Object.assign({}, payload), { userId: user.userId, documentUrls, status: "applied" });
    return vendor_model_1.default.create(vendorData);
});
/* Get Pending Vendor Applications */
const getPendingVendorApplications = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (skip = 0, limit = 10) {
    const query = {
        status: "applied",
    };
    return (0, infinitePaginate_1.infinitePaginate)(vendor_model_1.default, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
});
/* Get All Vendors */
const getAllVendors = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.keyword) {
        query.$text = {
            $search: filters.keyword,
        };
    }
    return (0, infinitePaginate_1.infinitePaginate)(vendor_model_1.default, query, skip, limit, []);
});
/* Get Single Vendor */
const getSingleVendorById = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield vendor_model_1.default.findById(vendorId);
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    return vendor;
});
// For vendors
const getMyVendorStats = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const vendor = yield vendor_model_1.default.findOne({ userId });
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    const stats = yield product_model_1.default.aggregate([
        {
            $match: {
                vendorId: vendor._id,
            },
        },
        {
            $group: {
                _id: null,
                totalProductsCount: { $sum: 1 },
                totalClicksCount: { $sum: "$totalClicks" },
            },
        },
    ]);
    const totalProductsCount = ((_a = stats[0]) === null || _a === void 0 ? void 0 : _a.totalProductsCount) || 0;
    const totalClicksCount = ((_b = stats[0]) === null || _b === void 0 ? void 0 : _b.totalClicksCount) || 0;
    return {
        totalProductsCount,
        totalClicksCount,
    };
});
const updateVendorStatus = (vendorId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield vendor_model_1.default.findByIdAndUpdate(vendorId, { status });
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    ;
    return {};
});
/* Suspend Vendor */
const suspendVendor = (vendorId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield vendor_model_1.default.findByIdAndUpdate(vendorId, {
        $set: {
            status: "suspended",
            suspensionReason: payload === null || payload === void 0 ? void 0 : payload.suspensionReason,
            suspendedAt: new Date(),
        },
    });
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    ;
    return vendor;
});
/* Withdraw Vendor Suspension */
const withdrawVendorSuspension = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    const vendor = yield vendor_model_1.default.findByIdAndUpdate(vendorId, {
        $set: {
            status: "approved",
        },
        $unset: {
            suspensionReason: "",
            suspendedAt: "",
        },
    }, { new: true });
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    return vendor;
});
exports.VendorServices = {
    applyVendor,
    getPendingVendorApplications,
    getAllVendors,
    getSingleVendorById,
    getMyVendorStats,
    updateVendorStatus,
    suspendVendor,
    withdrawVendorSuspension,
};
