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
exports.AyurvedaServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const ayurveda_model_1 = __importDefault(require("./ayurveda.model"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
// Add
const addAyurveda = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ayurveda_model_1.default.create(payload);
    return result;
});
// Get All
const getAllAyurveda = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    if (filters.category) {
        query.category = filters.category.trim().toLowerCase();
    }
    return (0, infinitePaginate_1.infinitePaginate)(ayurveda_model_1.default, query, skip, limit, []);
});
// Get Single
const getSingleAyurvedaById = (ayurvedaId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield ayurveda_model_1.default.findById(ayurvedaId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Ayurveda not found");
    }
    return result;
});
// Update
const updateAyurveda = (ayurvedaId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield ayurveda_model_1.default.findById(ayurvedaId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Ayurveda not found");
    }
    const result = yield ayurveda_model_1.default.findByIdAndUpdate(ayurvedaId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete
const deleteAyurveda = (ayurvedaId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield ayurveda_model_1.default.findById(ayurvedaId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Ayurveda not found");
    }
    return yield ayurveda_model_1.default.findByIdAndDelete(ayurvedaId);
});
exports.AyurvedaServices = {
    addAyurveda,
    getAllAyurveda,
    getSingleAyurvedaById,
    updateAyurveda,
    deleteAyurveda,
};
