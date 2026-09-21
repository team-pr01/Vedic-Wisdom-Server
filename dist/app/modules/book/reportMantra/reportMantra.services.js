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
exports.ReportMantraService = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const reportMantra_model_1 = __importDefault(require("./reportMantra.model"));
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const bookText_model_1 = __importDefault(require("../texts/bookText.model"));
// Create a new reported mantra
const reportMantra = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportMantra_model_1.default.create(payload);
    return result;
});
// Get all reported mantras
const getAllReportedMantras = (status) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {};
    if (status) {
        query.status = status;
    }
    const result = yield reportMantra_model_1.default.find(query).populate("bookId", "name type structure");
    return result;
});
// Get a single reported mantra by ID
const getSingleReportedMantra = (reportId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportMantra_model_1.default.findById(reportId)
        .populate("bookId", "name type levels structure")
        .populate("textId", "originalText translation location");
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Reported mantra not found");
    }
    return result;
});
// Update report status (mark as human verified)
const updateReportStatus = (reportId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existingReport = yield reportMantra_model_1.default.findById(reportId);
    if (!existingReport) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Reported mantra not found");
    }
    const updatedReport = yield reportMantra_model_1.default.findByIdAndUpdate(reportId, payload, { new: true, runValidators: true });
    return updatedReport;
});
const resolveIssue = (textId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { langCode, translation, reportId, status } = payload;
    const bookText = yield bookText_model_1.default.findById(textId);
    if (!bookText) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Book text not found");
    }
    const translationObj = (_a = bookText === null || bookText === void 0 ? void 0 : bookText.translations) === null || _a === void 0 ? void 0 : _a.find((t) => t.langCode === langCode);
    if (translationObj) {
        translationObj.translation = translation;
        translationObj.isHumanVerified = true;
    }
    else {
        (_b = bookText === null || bookText === void 0 ? void 0 : bookText.translations) === null || _b === void 0 ? void 0 : _b.push({
            langCode,
            translation,
            isHumanVerified: true,
            sanskritWordBreakdown: [],
        });
    }
    yield reportMantra_model_1.default.findByIdAndUpdate(reportId, { status }, { new: true, runValidators: true });
    // Save updated document
    yield bookText.save();
    return bookText;
});
// Delete Reported Mantra
const deleteReportedMantra = (reportId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield reportMantra_model_1.default.findByIdAndDelete(reportId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Reported mantra not found");
    }
    return result;
});
exports.ReportMantraService = {
    reportMantra,
    getAllReportedMantras,
    getSingleReportedMantra,
    updateReportStatus,
    resolveIssue,
    deleteReportedMantra,
};
