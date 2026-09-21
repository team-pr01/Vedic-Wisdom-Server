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
exports.AyurvedaControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ayurveda_services_1 = require("./ayurveda.services");
// Add
const addAyurveda = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ayurveda_services_1.AyurvedaServices.addAyurveda(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Ayurveda added successfully",
        data: result,
    });
}));
// Get All
const getAllAyurveda = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, category, skip = "0", limit = "10" } = req.query;
    const filters = {
        keyword: keyword,
        category: category,
    };
    const result = yield ayurveda_services_1.AyurvedaServices.getAllAyurveda(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Ayurveda fetched successfully.",
        data: {
            ayurveda: result.data,
            meta: result.meta,
        },
    });
}));
// Get Single
const getSingleAyurvedaById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ayurvedaId } = req.params;
    const result = yield ayurveda_services_1.AyurvedaServices.getSingleAyurvedaById(ayurvedaId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Ayurveda fetched successfully.",
        data: result,
    });
}));
// Update
const updateAyurveda = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ayurvedaId } = req.params;
    const result = yield ayurveda_services_1.AyurvedaServices.updateAyurveda(ayurvedaId, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Ayurveda updated successfully",
        data: result,
    });
}));
// Delete
const deleteAyurveda = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ayurvedaId } = req.params;
    const result = yield ayurveda_services_1.AyurvedaServices.deleteAyurveda(ayurvedaId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Ayurveda deleted successfully.",
        data: result,
    });
}));
exports.AyurvedaControllers = {
    addAyurveda,
    getAllAyurveda,
    getSingleAyurvedaById,
    updateAyurveda,
    deleteAyurveda,
};
