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
exports.JobServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const job_model_1 = __importDefault(require("./job.model"));
const infinitePaginate_1 = require("../../utils/infinitePaginate");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const application_model_1 = __importDefault(require("./applications/application.model"));
/* Post Job */
const postJob = (payload, user, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (typeof (payload === null || payload === void 0 ? void 0 : payload.company) === "string") {
        payload.company = JSON.parse(payload === null || payload === void 0 ? void 0 : payload.company);
    }
    if (typeof (payload === null || payload === void 0 ? void 0 : payload.salary) === "string") {
        payload.salary = JSON.parse(payload === null || payload === void 0 ? void 0 : payload.salary);
    }
    let uploadedUrl = "";
    // Upload to Cloudinary
    if (file) {
        const imageName = `job-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        uploadedUrl = secure_url;
    }
    // Attach file based on hiring type
    if (payload.company) {
        payload.company = Object.assign(Object.assign({}, payload.company), { logo: uploadedUrl });
    }
    payload.postedBy = user === null || user === void 0 ? void 0 : user.userId;
    const result = yield job_model_1.default.create(payload);
    return result;
});
/* Get All Jobs */
const getAllJobs = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // 🔍 Text Search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    // Status
    if (filters.status && filters.status !== "all") {
        query.status = filters.status;
    }
    // City
    if (filters.city) {
        query["location.city"] = { $regex: filters.city.trim(), $options: "i" };
    }
    // State
    if (filters.state) {
        query["location.state"] = { $regex: filters.state.trim(), $options: "i" };
    }
    // Country
    if (filters.country) {
        query["location.country"] = { $regex: filters.country.trim(), $options: "i" };
    }
    // Job Type (handle array or single value)
    if (filters.jobType) {
        const jobTypes = typeof filters.jobType === 'string'
            ? filters.jobType.split(',').map((item) => item.trim())
            : filters.jobType;
        if (jobTypes.length === 1) {
            query.jobType = jobTypes[0];
        }
        else if (jobTypes.length > 1) {
            query.jobType = { $in: jobTypes };
        }
    }
    // Work Mode (handle array or single value)
    if (filters.workMode) {
        const workModes = typeof filters.workMode === 'string'
            ? filters.workMode.split(',').map((item) => item.trim())
            : filters.workMode;
        if (workModes.length === 1) {
            query.workMode = workModes[0];
        }
        else if (workModes.length > 1) {
            query.workMode = { $in: workModes };
        }
    }
    // Experience Level (handle array or single value)
    if (filters.experienceLevel) {
        const experienceLevels = typeof filters.experienceLevel === 'string'
            ? filters.experienceLevel.split(',').map((item) => item.trim())
            : filters.experienceLevel;
        if (experienceLevels.length === 1) {
            query.experienceLevel = experienceLevels[0];
        }
        else if (experienceLevels.length > 1) {
            query.experienceLevel = { $in: experienceLevels };
        }
    }
    // Category (handle array or single value)
    if (filters.category) {
        const categories = typeof filters.category === 'string'
            ? filters.category.split(',').map((item) => item.trim())
            : filters.category;
        if (categories.length === 1) {
            query.category = categories[0];
        }
        else if (categories.length > 1) {
            query.category = { $in: categories };
        }
    }
    return (0, infinitePaginate_1.infinitePaginate)(job_model_1.default, query, skip, limit, [] // populate array if needed later
    );
});
/* Get Single Job */
const getSingleJobById = (jobId) => __awaiter(void 0, void 0, void 0, function* () {
    if (!mongoose_1.default.Types.ObjectId.isValid(jobId)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid job ID");
    }
    const result = yield job_model_1.default.findById(jobId);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    }
    return result;
});
/* Update Job */
const updateJob = (jobId, payload, file) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield job_model_1.default.findById(jobId);
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    let uploadedUrl;
    if (file) {
        const imageName = `job-${Date.now()}`;
        const path = file.path;
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(imageName, path);
        uploadedUrl = secure_url;
    }
    if (uploadedUrl) {
        payload["company.logo"] = uploadedUrl;
    }
    const result = yield job_model_1.default.findByIdAndUpdate(jobId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
/* Delete Job */
const deleteJob = (jobId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield job_model_1.default.findById(jobId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    }
    // ✅ Admin & Moderator can delete any job
    if (userRole === "admin" || userRole === "moderator") {
        return yield job_model_1.default.findByIdAndDelete(jobId);
    }
    // ✅ Normal user → only own job
    if (existing.postedBy.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to delete this job");
    }
    yield application_model_1.default.deleteMany({ jobId });
    yield job_model_1.default.findByIdAndDelete(jobId);
    return {};
});
/* Update Status */
const updateStatus = (jobId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield job_model_1.default.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    return result;
});
exports.JobServices = {
    postJob,
    getAllJobs,
    getSingleJobById,
    updateJob,
    deleteJob,
    updateStatus,
};
