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
exports.PopupServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const popup_model_1 = __importDefault(require("./popup.model"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
// Create Popup
const createPopup = (payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    let imageUrl = "";
    if (file) {
        const imageName = `${payload.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    const payloadData = Object.assign(Object.assign({}, payload), { imageUrl, targetPages: payload.targetPages ? JSON.parse(payload.targetPages) : [] });
    const result = yield popup_model_1.default.create(payloadData);
    return result;
});
// Get All Popups (with optional title search)
const getAllPopups = (keyword) => __awaiter(void 0, void 0, void 0, function* () {
    const filter = {};
    if (keyword) {
        filter.title = { $regex: keyword, $options: "i" };
    }
    const result = yield popup_model_1.default.find(filter);
    return result;
});
// Get Single Popup by ID
const getPopupById = (popupId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield popup_model_1.default.findById(popupId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Popup not found");
    }
    return result;
});
// Update Popup
const updatePopup = (popupId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield popup_model_1.default.findById(popupId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Popup not found");
    }
    let imageUrl;
    if (file) {
        const imageName = `${(payload === null || payload === void 0 ? void 0 : payload.title) || existing.title}-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        imageUrl = secure_url;
    }
    // Parse targetPages if it exists
    const parsedPayload = Object.assign({}, payload);
    if (payload.targetPages) {
        try {
            parsedPayload.targetPages = typeof payload.targetPages === 'string'
                ? JSON.parse(payload.targetPages)
                : payload.targetPages;
        }
        catch (error) {
            parsedPayload.targetPages = [];
        }
    }
    if (imageUrl) {
        parsedPayload.imageUrl = imageUrl;
    }
    const result = yield popup_model_1.default.findByIdAndUpdate(popupId, parsedPayload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete Popup
const deletePopup = (popupId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield popup_model_1.default.findById(popupId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Popup not found");
    }
    yield popup_model_1.default.findByIdAndDelete(popupId);
    return null;
});
exports.PopupServices = {
    createPopup,
    getAllPopups,
    getPopupById,
    updatePopup,
    deletePopup,
};
