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
exports.ConsultationServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const consultations_model_1 = __importDefault(require("./consultations.model"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const sendSingleNotification_1 = require("../../../utils/sendSingleNotification");
const generateConsultationId = () => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000); // 6 random digits
    return `C-${randomDigits}`;
};
// Book a consultation
const bookConsultation = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const payloadData = Object.assign(Object.assign({}, payload), { userId, consultationId: generateConsultationId() });
    const result = yield consultations_model_1.default.create(payloadData);
    return result;
});
// Get all consultations (admin)
const getAllConsultations = (keyword_1, status_1, ...args_1) => __awaiter(void 0, [keyword_1, status_1, ...args_1], void 0, function* (keyword, status, skip = 0, limit = 10) {
    const query = {};
    /*  SEARCH */
    if (keyword) {
        query.$or = [
            { consultationId: { $regex: keyword, $options: "i" } },
            { $text: { $search: keyword } },
        ];
    }
    /* FILTER */
    if (status) {
        query.status = status.trim().toLowerCase();
    }
    return (0, infinitePaginate_1.infinitePaginate)(consultations_model_1.default, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
        { path: "consultantId", select: "name email phoneNumber category" },
    ]);
});
// Get single consultation by id
const getSingleConsultationById = (consultationId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultations_model_1.default.findById(consultationId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultation not found");
    }
    return result;
});
// Get my consultations (logged-in user)
const getMyConsultations = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultations_model_1.default.find({ userId });
    return result;
});
const scheduleConsultation = (consultationId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existing = yield consultations_model_1.default.findById(consultationId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultation not found");
    }
    existing.scheduledAt = new Date(payload === null || payload === void 0 ? void 0 : payload.scheduledAt);
    existing.meetingLink = payload === null || payload === void 0 ? void 0 : payload.meetingLink;
    existing.status = "scheduled";
    yield existing.save();
    // Populate user and consultant for consistency
    const result = yield consultations_model_1.default.findById(consultationId)
        .populate("userId", "name email phoneNumber")
        .populate("consultantId", "name email phoneNumber");
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultation not found after update");
    }
    const userId = (_a = result.userId) === null || _a === void 0 ? void 0 : _a._id;
    const meetingLink = result.meetingLink || "";
    if (userId) {
        (0, sendSingleNotification_1.sendSingleNotification)(userId, "Consultation Scheduled 🗓️", `Your consultation has been scheduled. Meeting link: ${meetingLink}`, `/my-consultations/${result._id}`, meetingLink);
    }
    return result;
});
// Update consultation status (admin)
const updateConsultationStatus = (consultationId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield consultations_model_1.default.findById(consultationId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultation not found");
    }
    const result = yield consultations_model_1.default.findByIdAndUpdate(consultationId, { status }, { new: true, runValidators: true });
    return result;
});
// Delete consultation
const deleteConsultation = (consultationId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultations_model_1.default.findByIdAndDelete(consultationId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Consultation not found");
    }
    return result;
});
exports.ConsultationServices = {
    bookConsultation,
    getAllConsultations,
    getSingleConsultationById,
    getMyConsultations,
    scheduleConsultation,
    updateConsultationStatus,
    deleteConsultation,
};
