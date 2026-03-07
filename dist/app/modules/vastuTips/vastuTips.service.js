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
exports.VastuTipsServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const vastuTips_model_1 = require("./vastuTips.model");
const infinitePaginate_1 = require("../../utils/infinitePaginate");
/* ================= ADD ================= */
const addVastuTips = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return vastuTips_model_1.VastuTips.create(payload);
});
/* ================= GET ALL ================= */
const getAllVastuTips = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    if (filters.category) {
        query.category = filters.category.trim().toLowerCase();
    }
    return (0, infinitePaginate_1.infinitePaginate)(vastuTips_model_1.VastuTips, query, skip, limit);
});
/* ================= GET SINGLE ================= */
const getSingleVastuTips = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_model_1.VastuTips.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vastu Tips not found");
    }
    return result;
});
/* ================= UPDATE ================= */
const updateVastuTips = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_model_1.VastuTips.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vastu Tips not found");
    }
    return result;
});
/* ================= DELETE ================= */
const deleteVastuTips = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield vastuTips_model_1.VastuTips.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Vastu Tips not found");
    }
    return result;
});
exports.VastuTipsServices = {
    addVastuTips,
    getAllVastuTips,
    getSingleVastuTips,
    updateVastuTips,
    deleteVastuTips,
};
