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
exports.ReportServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const report_model_1 = require("./report.model");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const submitReport = (reporterId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (reporterId === payload.targetId) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You cannot report yourself.");
    }
    // Optional: Prevent spamming the report button (e.g., max 1 report per day per user)
    const existingReport = yield report_model_1.Report.findOne({
        reporterId: new mongoose_1.Types.ObjectId(reporterId),
        targetId: new mongoose_1.Types.ObjectId(payload.targetId),
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    });
    if (existingReport) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already reported this recently.");
    }
    const report = yield report_model_1.Report.create({
        reporterId: new mongoose_1.Types.ObjectId(reporterId),
        targetId: new mongoose_1.Types.ObjectId(payload.targetId),
        reportType: payload.reportType,
        reason: payload.reason,
    });
    return report;
});
exports.ReportServices = {
    submitReport,
};
