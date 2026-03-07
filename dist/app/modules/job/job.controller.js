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
exports.JobControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const job_service_1 = require("./job.service");
// Post Job
const postJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    const user = req.user;
    const result = yield job_service_1.JobServices.postJob(req.body, user, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job posted successfully",
        data: result,
    });
}));
// Get All Jobs
const getAllJobs = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status, city, state, country, jobType, workMode, experienceLevel, skip = "0", limit = "10", } = req.query;
    const filters = {
        keyword: keyword,
        status: status,
        city: city,
        state: state,
        country: country,
        jobType: jobType,
        workMode: workMode,
        experienceLevel: experienceLevel,
    };
    const result = yield job_service_1.JobServices.getAllJobs(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Jobs fetched successfully",
        data: {
            jobs: result.data,
            meta: result.meta,
        },
    });
}));
// Get Single Job
const getSingleJobById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const result = yield job_service_1.JobServices.getSingleJobById(jobId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job fetched successfully",
        data: result,
    });
}));
// Update Job
const updateJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const file = req.file;
    if (typeof req.body.company === "string") {
        req.body.company = JSON.parse(req.body.company);
    }
    if (typeof req.body.individual === "string") {
        req.body.individual = JSON.parse(req.body.individual);
    }
    const result = yield job_service_1.JobServices.updateJob(jobId, req.body, file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job updated successfully",
        data: result,
    });
}));
// Delete Job
const deleteJob = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const { userId, role } = req.user;
    const result = yield job_service_1.JobServices.deleteJob(jobId, userId, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job deleted successfully",
        data: result,
    });
}));
// Update Status
const updateStatus = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { jobId } = req.params;
    const { status } = req.body;
    const result = yield job_service_1.JobServices.updateStatus(jobId, status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Job status updated successfully",
        data: result,
    });
}));
exports.JobControllers = {
    postJob,
    getAllJobs,
    getSingleJobById,
    updateJob,
    deleteJob,
    updateStatus,
};
