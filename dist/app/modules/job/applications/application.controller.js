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
exports.ApplicationControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const application_service_1 = require("./application.service");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
// Apply
const applyOnJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    const file = req.file;
    const result = yield application_service_1.ApplicationServices.applyOnJob(req.body, userId, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Applied successfully",
        data: result,
    });
}));
// Withdraw
const withdrawApplication = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const result = yield application_service_1.ApplicationServices.withdrawApplication(applicationId, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Application withdrawn",
        data: result,
    });
}));
// Get All
const getAllApplications = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status, skip = "0", limit = "10" } = req.query;
    const filters = {
        keyword: keyword,
        status: status,
    };
    const result = yield application_service_1.ApplicationServices.getAllApplications(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Applications fetched",
        data: result,
    });
}));
// Get  all applications By Job id
const getApplicationsByJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const { userId, role } = req.user;
    const result = yield application_service_1.ApplicationServices.getApplicationsByJob(jobId, userId, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Applications fetched successfully",
        data: result,
    });
}));
// Get Single
const getSingleApplicationById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    const result = yield application_service_1.ApplicationServices.getSingleApplicationById(applicationId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Application fetched",
        data: result,
    });
}));
// Update Status
const updateStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    const { status } = req.body;
    const { userId, role } = req.user;
    const result = yield application_service_1.ApplicationServices.updateStatus(applicationId, status, userId, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Application status updated successfully",
        data: result,
    });
}));
//  Delete
const deleteApplication = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { applicationId } = req.params;
    const { userId, role } = req.user;
    const result = yield application_service_1.ApplicationServices.deleteApplication(applicationId, userId, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Application deleted successfully",
        data: result,
    });
}));
exports.ApplicationControllers = {
    applyOnJob,
    withdrawApplication,
    getAllApplications,
    getApplicationsByJob,
    getSingleApplicationById,
    updateStatus,
    deleteApplication,
};
