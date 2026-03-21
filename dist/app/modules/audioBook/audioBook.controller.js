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
exports.AudioBookControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const audioBook_service_1 = require("./audioBook.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
/* ADD AUDIOBOOK */
const addAudioBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield audioBook_service_1.AudioBookServices.addAudioBook(req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "AudioBook created successfully",
        data: result,
    });
}));
/* GET ALL */
const getAllAudioBooks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, isPremium, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword,
        isPremium: isPremium === undefined
            ? undefined
            : isPremium === "true",
    };
    const result = yield audioBook_service_1.AudioBookServices.getAllAudioBooks(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "AudioBooks fetched successfully",
        data: result,
    });
}));
/* GET SINGLE */
const getSingleAudioBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield audioBook_service_1.AudioBookServices.getSingleAudioBook(req.params.audioBookId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "AudioBook fetched successfully",
        data: result,
    });
}));
/* UPDATE */
const updateAudioBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const result = yield audioBook_service_1.AudioBookServices.updateAudioBook(req.params.audioBookId, req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "AudioBook updated successfully",
        data: result,
    });
}));
/* DELETE */
const deleteAudioBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield audioBook_service_1.AudioBookServices.deleteAudioBook(req.params.audioBookId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "AudioBook deleted successfully",
        data: null,
    });
}));
exports.AudioBookControllers = {
    addAudioBook,
    getAllAudioBooks,
    getSingleAudioBook,
    updateAudioBook,
    deleteAudioBook,
};
