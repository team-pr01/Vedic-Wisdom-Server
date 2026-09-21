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
exports.ReportMantraController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const reportMantra_services_1 = require("./reportMantra.services");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
// Create a new reported mantra
const reportMantra = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportMantra_services_1.ReportMantraService.reportMantra(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Mantra reported successfully",
        data: result,
    });
}));
// Get all reported mantras
const getAllReportedMantras = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = req.query;
    const result = yield reportMantra_services_1.ReportMantraService.getAllReportedMantras(status);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All reported mantras fetched successfully",
        data: result,
    });
}));
// Get a single reported mantra by ID
const getSingleReportedMantra = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportId } = req.params;
    const result = yield reportMantra_services_1.ReportMantraService.getSingleReportedMantra(reportId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Reported mantra not found");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reported mantra fetched successfully",
        data: result,
    });
}));
// Update report status (mark as human verified)
const updateReportStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportId } = req.params;
    const result = yield reportMantra_services_1.ReportMantraService.updateReportStatus(reportId, req.body);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Reported mantra not found");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Report marked as human verified successfully",
        data: result,
    });
}));
const resolveIssue = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { textId } = req.params;
    const { langCode, translation } = req.body;
    if (!textId || !langCode || !translation) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "textId, langCode, and translation are required");
    }
    const result = yield reportMantra_services_1.ReportMantraService.resolveIssue(textId, req.body);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Translation updated successfully",
        data: result,
    });
}));
// Delete Reported Mantra
const deleteReportedMantra = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { reportId } = req.params;
    const result = yield reportMantra_services_1.ReportMantraService.deleteReportedMantra(reportId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reported mantra deleted successfully",
        data: result,
    });
}));
exports.ReportMantraController = {
    reportMantra,
    getAllReportedMantras,
    getSingleReportedMantra,
    updateReportStatus,
    resolveIssue,
    deleteReportedMantra
};
