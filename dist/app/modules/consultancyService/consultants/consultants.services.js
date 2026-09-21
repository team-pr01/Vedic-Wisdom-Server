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
exports.ConsultancyServiceServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const consultants_model_1 = __importDefault(require("./consultants.model"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../../utils/deleteImageFromCloudinary");
// Add consultant (admin only)
const addConsultant = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `${payload.name}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { imageUrl, specialties: payload.specialties ? JSON.parse(payload.specialties) : [] });
    const result = yield consultants_model_1.default.create(payloadData);
    return result;
});
// Get all consultant
const getAllConsultants = (keyword_1, category_1, ...args_1) => __awaiter(void 0, [keyword_1, category_1, ...args_1], void 0, function* (keyword, category, skip = 0, limit = 10) {
    const query = {};
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { specialty: { $regex: keyword, $options: "i" } },
        ];
    }
    if (category) {
        query.category = { $regex: `^${category}$`, $options: "i" };
    }
    return (0, infinitePaginate_1.infinitePaginate)(consultants_model_1.default, query, skip, limit, []);
});
const getConsultantsByCategory = (category_1, keyword_1, ...args_1) => __awaiter(void 0, [category_1, keyword_1, ...args_1], void 0, function* (category, keyword, skip = 0, limit = 10) {
    const query = {};
    console.log(category);
    // Category filter (required)
    if (category) {
        query.category = { $regex: `^${category}$`, $options: "i" };
    }
    // Keyword search (optional)
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { specialty: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }
    return (0, infinitePaginate_1.infinitePaginate)(consultants_model_1.default, query, skip, limit, []);
});
// Get single consultant by ID
const getSingleConsultantsById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultants_model_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultant not found");
    }
    return result;
});
// Update consultant
const updateConsultant = (id, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield consultants_model_1.default.findById(id);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultant not found");
    }
    let imageUrl;
    if (file) {
        const imageName = `${(payload === null || payload === void 0 ? void 0 : payload.name) || existing.name}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (imageUrl && { imageUrl }));
    const result = yield consultants_model_1.default.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete consultant by ID
const deleteConsultant = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultants_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultant not found");
    }
    if (result.imageUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(result.imageUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    return result;
});
exports.ConsultancyServiceServices = {
    addConsultant,
    getAllConsultants,
    getConsultantsByCategory,
    getSingleConsultantsById,
    updateConsultant,
    deleteConsultant,
};
