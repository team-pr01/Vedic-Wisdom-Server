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
exports.ApplicationServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const job_model_1 = __importDefault(require("../job.model"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const application_model_1 = __importDefault(require("./application.model"));
const sendImageToCloudinary_1 = require("../../../utils/sendImageToCloudinary");
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
/* Apply */
const applyOnJob = (payload, userId, file) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = payload === null || payload === void 0 ? void 0 : payload.jobId;
    const job = yield job_model_1.default.findById(jobId);
    if (!job)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    // Prevent duplicate apply
    const exists = yield application_model_1.default.findOne({ jobId, userId });
    if (exists)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Already applied");
    // Upload resume
    let resumeUrl = "";
    if (file) {
        const { secure_url } = yield (0, sendImageToCloudinary_1.sendImageToCloudinary)(`resume-${Date.now()}`, file.path);
        resumeUrl = secure_url;
    }
    const application = yield application_model_1.default.create(Object.assign(Object.assign({}, payload), { jobId,
        userId, resume: resumeUrl }));
    // Update Job counters
    yield job_model_1.default.findByIdAndUpdate(jobId, {
        $inc: { applicationCount: 1 },
        $push: { applications: application._id },
    });
    return application;
});
/* Withdraw */
const withdrawApplication = (applicationId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const application = yield application_model_1.default.findById(applicationId);
    if (!application)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Not found");
    if (application.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "Not allowed");
    }
    application.status = "withdrawn";
    yield application.save();
    // Update Job counters
    yield job_model_1.default.findByIdAndUpdate(application.jobId, {
        $inc: { applicationCount: -1 },
        $pull: { applications: application._id },
    });
    return application;
});
/* Get All */
const getAllApplications = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    if (filters.status) {
        query.status = filters.status;
    }
    return (0, infinitePaginate_1.infinitePaginate)(application_model_1.default, query, skip, limit, [
        { path: "jobId" },
        { path: "userId" },
    ]);
});
// Get  all applications By Job id
const getApplicationsByJob = (jobId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const job = yield job_model_1.default.findById(jobId);
    if (!job)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    // ✅ Admin & Moderator → can view any job applications
    if (userRole !== "admin" && userRole !== "moderator") {
        // ✅ Only job owner allowed
        if (job.postedBy.toString() !== userId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view these applications");
        }
    }
    const applications = yield application_model_1.default.find({ jobId })
        .populate("userId", "name email phoneNumber")
        .sort({ createdAt: -1 });
    return applications;
});
/* Get Single */
const getSingleApplicationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield application_model_1.default.findById(id)
        .populate("userId", "name email phoneNumber country state city area");
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Not found");
    return result;
});
/* Update Status */
const updateStatus = (applicationId, status, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const app = yield application_model_1.default.findById(applicationId);
    if (!app)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Application not found");
    const job = yield job_model_1.default.findById(app.jobId);
    if (!job)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Related job not found");
    // Authorization
    if (userRole !== "admin" && userRole !== "moderator") {
        if (job.postedBy.toString() !== userId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update this application");
        }
    }
    // Update application status
    app.status = status;
    yield app.save();
    // BUSINESS RULE: If hired → close job
    if (status === "hired") {
        job.status = "closed";
        yield job.save();
    }
    return app;
});
/* Delete */
const deleteApplication = (applicationId, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const app = yield application_model_1.default.findById(applicationId);
    if (!app)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Application not found");
    // ✅ Admin & Moderator → delete any
    if (userRole === "admin" || userRole === "moderator") {
        yield job_model_1.default.findByIdAndUpdate(app.jobId, {
            $inc: { applicationCount: -1 },
            $pull: { applications: app._id },
        });
        return yield application_model_1.default.findByIdAndDelete(applicationId);
    }
    // ✅ User → only own application
    if (app.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to delete this application");
    }
    yield job_model_1.default.findByIdAndUpdate(app.jobId, {
        $inc: { applicationCount: -1 },
        $pull: { applications: app._id },
    });
    return yield application_model_1.default.findByIdAndDelete(applicationId);
});
exports.ApplicationServices = {
    applyOnJob,
    withdrawApplication,
    getAllApplications,
    getApplicationsByJob,
    getSingleApplicationById,
    updateStatus,
    deleteApplication,
};
