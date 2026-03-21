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
exports.ProductServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const product_model_1 = __importDefault(require("./product.model"));
const vendor_model_1 = __importDefault(require("../vendor/vendor.model"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const auth_model_1 = require("../../auth/auth.model");
const deleteImageFromCloudinary_1 = require("../../../utils/deleteImageFromCloudinary");
const addProduct = (userId, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield auth_model_1.User.findById(userId).lean();
    // Checking if vendor is approved or not
    if ((user === null || user === void 0 ? void 0 : user.role) === "user") {
        const vendor = yield vendor_model_1.default.findOne({
            userId,
            status: "approved",
        });
        if (!vendor) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Vendor not approved");
        }
    }
    ;
    let imageUrls = [];
    if (files.length) {
        const uploads = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`product-${Date.now()}-${index}`, file.path);
            return secure_url;
        }));
        imageUrls = yield Promise.all(uploads);
    }
    const product = yield product_model_1.default.create(Object.assign(Object.assign({}, payload), { imageUrls, addedBy: userId }));
    return product;
});
/* Get All Products */
const getAllProducts = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.category) {
        query.category = filters.category;
    }
    if (filters.keyword) {
        query.$text = {
            $search: filters.keyword,
        };
    }
    return (0, infinitePaginate_1.infinitePaginate)(product_model_1.default, query, skip, limit, []);
});
/* Get Single Product */
const getSingleProductById = (productId) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    return product;
});
// For Vendor
const getMyProducts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const vendor = yield vendor_model_1.default.findOne({
        userId,
        status: "approved",
    }).lean();
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Vendor not approved or not found");
    }
    const query = {
        addedBy: userId,
    };
    return (0, infinitePaginate_1.infinitePaginate)(product_model_1.default, query, skip, limit);
});
// For admin
const getVendorProducts = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const vendor = yield vendor_model_1.default.findOne({ userId }).lean();
    if (!vendor) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vendor not found");
    }
    const query = {
        addedBy: vendor.userId,
    };
    return (0, infinitePaginate_1.infinitePaginate)(product_model_1.default, query, skip, limit);
});
/* Update Product */
const updateProduct = (productId, userId, payload, files) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    const user = yield auth_model_1.User.findById(userId).lean();
    // Checking if vendor is approved or not
    if ((user === null || user === void 0 ? void 0 : user.role) === "user") {
        const vendor = yield vendor_model_1.default.findOne({
            userId,
            status: "approved",
        });
        if (!vendor) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Vendor not approved");
        }
        if (vendor.userId.toString() !== product.addedBy.toString()) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not allowed");
        }
    }
    ;
    let imageUrls = product.imageUrls || [];
    if (files === null || files === void 0 ? void 0 : files.length) {
        const uploads = files.map((file, index) => __awaiter(void 0, void 0, void 0, function* () {
            const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`product-${Date.now()}-${index}`, file.path);
            return secure_url;
        }));
        const uploadedImages = yield Promise.all(uploads);
        imageUrls = [...imageUrls, ...uploadedImages];
    }
    const updatedProduct = yield product_model_1.default.findByIdAndUpdate(productId, Object.assign(Object.assign({}, payload), { imageUrls }), { new: true });
    return updatedProduct;
});
const deleteProduct = (productId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const product = yield product_model_1.default.findById(productId);
    if (!product) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Product not found");
    }
    if (userId.toString() !== product.addedBy.toString()) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not allowed");
    }
    /* Delete images from cloudinary */
    if ((_a = product.imageUrls) === null || _a === void 0 ? void 0 : _a.length) {
        yield Promise.all(product.imageUrls.map((url) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const publicId = (_a = url.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
            if (publicId) {
                yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
            }
        })));
    }
    yield product_model_1.default.findByIdAndDelete(productId);
    return true;
});
exports.ProductServices = {
    addProduct,
    getAllProducts,
    getSingleProductById,
    getMyProducts,
    getVendorProducts,
    updateProduct,
    deleteProduct,
};
