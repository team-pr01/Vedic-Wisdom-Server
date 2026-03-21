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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookTextController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const bookText_services_1 = require("./bookText.services");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const createBookText = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield bookText_services_1.BookTextService.createBookText(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Book text created successfully",
        data: result,
    });
}));
const getAllBookTexts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword } = req.query;
    const result = yield bookText_services_1.BookTextService.getAllBookTexts(keyword);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book texts retrieved successfully",
        data: result,
    });
}));
const getSingleBookText = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookTextId } = req.params;
    const result = yield bookText_services_1.BookTextService.getSingleBookText(bookTextId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book text retrieved successfully",
        data: result,
    });
}));
const getBookTextByDetails = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.query, { bookId } = _a, levels = __rest(_a, ["bookId"]);
    if (!bookId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Book ID is required");
    }
    // Convert query params to Record<string, string>
    const searchLevels = {};
    Object.keys(levels).forEach((key) => {
        const value = levels[key];
        if (typeof value === "string")
            searchLevels[key] = value;
    });
    const result = yield bookText_services_1.BookTextService.getBookTextByDetails(bookId, searchLevels);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book text fetched successfully",
        data: result,
    });
}));
const getAllBookTextsByBookId = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookId } = req.params;
    const result = yield bookText_services_1.BookTextService.getAllBookTextsByBookId(bookId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book texts retrieved successfully by bookId",
        data: result,
    });
}));
const filterBookTexts = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const _a = req.query, { bookId } = _a, filters = __rest(_a, ["bookId"]);
    const result = yield bookText_services_1.BookTextService.filterBookTexts(bookId, filters);
    res.status(200).json({
        success: true,
        message: "Filtered BookTexts fetched successfully",
        data: result,
    });
}));
const updateBookText = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookTextId } = req.params;
    const result = yield bookText_services_1.BookTextService.updateBookText(bookTextId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Text updated successfully",
        data: result,
    });
}));
const updateTranslations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookTextId } = req.params;
    const result = yield bookText_services_1.BookTextService.updateBookText(bookTextId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book text updated successfully",
        data: result,
    });
}));
const deleteBookText = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookTextId } = req.params;
    const result = yield bookText_services_1.BookTextService.deleteBookText(bookTextId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book text deleted successfully",
        data: result,
    });
}));
exports.BookTextController = {
    createBookText,
    getAllBookTexts,
    getSingleBookText,
    getBookTextByDetails,
    getAllBookTextsByBookId,
    updateBookText,
    updateTranslations,
    deleteBookText,
    filterBookTexts,
};
