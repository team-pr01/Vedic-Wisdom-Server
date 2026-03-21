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
exports.BooksService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const books_model_1 = __importDefault(require("./books.model"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../../utils/deleteImageFromCloudinary");
const createBook = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `Book-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { imageUrl });
    const result = yield books_model_1.default.create(payloadData);
    return result;
});
const getAllBooks = (keyword_1, ...args_1) => __awaiter(void 0, [keyword_1, ...args_1], void 0, function* (keyword, skip = 0, limit = 10) {
    const query = {};
    if (keyword) {
        query.$text = { $search: keyword };
    }
    return (0, infinitePaginate_1.infinitePaginate)(books_model_1.default, query, skip, limit);
});
const getSingleBook = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    const book = yield books_model_1.default.findById(bookId);
    if (!book) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book not found");
    }
    return book;
});
const updateBook = (bookId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield books_model_1.default.findById(bookId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book not found");
    }
    let imageUrl = existing.imageUrl;
    /* ---------- REPLACE IMAGE ---------- */
    if (file) {
        // delete old image
        if (existing.imageUrl) {
            const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(existing.imageUrl);
            yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
        }
        const imageName = `Book-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (imageUrl && { imageUrl }));
    const result = yield books_model_1.default.findByIdAndUpdate(bookId, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteBook = (bookId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield books_model_1.default.findById(bookId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book not found");
    }
    /* ---------- DELETE IMAGE FROM CLOUDINARY ---------- */
    if (existing.imageUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(existing.imageUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    yield books_model_1.default.findByIdAndDelete(bookId);
    return {};
});
exports.BooksService = {
    createBook,
    getAllBooks,
    getSingleBook,
    updateBook,
    deleteBook,
};
