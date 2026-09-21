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
exports.DonationProgramsService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const donationPrograms_model_1 = __importDefault(require("./donationPrograms.model"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const deleteImageFromCloudinary_1 = require("../../utils/deleteImageFromCloudinary");
// Create donation program (admin only)
const addDonationProgram = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `${payload.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { amountNeeded: Number(payload.amountNeeded), imageUrl });
    const result = yield donationPrograms_model_1.default.create(payloadData);
    return result;
});
// Get all donation programs (with optional keyword & category)
const getAllDonationPrograms = (keyword_1, ...args_1) => __awaiter(void 0, [keyword_1, ...args_1], void 0, function* (keyword, skip = 0, limit = 10) {
    const query = {};
    // 🔍 Search
    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }
    return (0, infinitePaginate_1.infinitePaginate)(donationPrograms_model_1.default, query, skip, limit, []);
});
// Get a single donation program by ID
const getSingleDonationProgramById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield donationPrograms_model_1.default.findById(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Donation program not found");
    }
    return result;
});
// Update donation program by ID
const updateDonationProgram = (id, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield donationPrograms_model_1.default.findById(id);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Donation program not found");
    }
    let imageUrl;
    if (file) {
        const imageName = `${(payload === null || payload === void 0 ? void 0 : payload.title) || existing.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const updatePayload = Object.assign(Object.assign({}, payload), (imageUrl && { imageUrl }));
    const result = yield donationPrograms_model_1.default.findByIdAndUpdate(id, updatePayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete donation program by ID
const deleteDonationProgram = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield donationPrograms_model_1.default.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Donation program not found");
    }
    if (result.imageUrl) {
        const publicId = (0, deleteImageFromCloudinary_1.extractPublicId)(result.imageUrl);
        yield (0, deleteImageFromCloudinary_1.deleteImageFromCloudinary)(publicId);
    }
    return result;
});
exports.DonationProgramsService = {
    addDonationProgram,
    getAllDonationPrograms,
    getSingleDonationProgramById,
    updateDonationProgram,
    deleteDonationProgram,
};
