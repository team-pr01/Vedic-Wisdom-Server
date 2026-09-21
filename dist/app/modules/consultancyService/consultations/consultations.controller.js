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
exports.ConsultationControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const consultations_services_1 = require("./consultations.services");
// Book a consultation
const bookConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultations_services_1.ConsultationServices.bookConsultation(req.body, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultation booked successfully",
        data: result,
    });
}));
// Get all consultations (admin)
const getAllConsultations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status, skip = "0", limit = "10" } = req.query;
    const result = yield consultations_services_1.ConsultationServices.getAllConsultations(keyword, status, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultations fetched successfully",
        data: {
            consultations: result.data,
            meta: result.meta,
        },
    });
}));
// Get single consultation by id
const getSingleConsultationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultationId } = req.params;
    const result = yield consultations_services_1.ConsultationServices.getSingleConsultationById(consultationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultation fetched successfully.",
        data: result,
    });
}));
// Get my consultations (for logged-in user)
const getMyConsultations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield consultations_services_1.ConsultationServices.getMyConsultations(req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Your consultations fetched successfully.",
        data: result,
    });
}));
// Schedule a consultation (update scheduledAt)
const scheduleConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultationId } = req.params;
    const result = yield consultations_services_1.ConsultationServices.scheduleConsultation(consultationId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultation scheduled successfully",
        data: result,
    });
}));
// Update consultation status (admin)
const updateConsultationStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultationId } = req.params;
    const { status } = req.body;
    const result = yield consultations_services_1.ConsultationServices.updateConsultationStatus(consultationId, status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultation status updated successfully",
        data: result,
    });
}));
// Delete consultation
const deleteConsultation = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { consultationId } = req.params;
    const result = yield consultations_services_1.ConsultationServices.deleteConsultation(consultationId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Consultation deleted successfully",
        data: result,
    });
}));
exports.ConsultationControllers = {
    bookConsultation,
    getAllConsultations,
    getSingleConsultationById,
    getMyConsultations,
    scheduleConsultation,
    updateConsultationStatus,
    deleteConsultation,
};
