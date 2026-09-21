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
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const mongoose_1 = require("mongoose");
/* Apply */
const applyOnJob = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = payload === null || payload === void 0 ? void 0 : payload.jobId;
    const job = yield job_model_1.default.findById(jobId);
    if (!job)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    // Prevent duplicate apply
    const exists = yield application_model_1.default.findOne({ jobId, userId });
    if (exists)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "You have already applied for this job.");
    const application = yield application_model_1.default.create(Object.assign(Object.assign({}, payload), { jobId,
        userId }));
    // Update Job counters
    yield job_model_1.default.findByIdAndUpdate(jobId, {
        $inc: { applicationCount: 1 },
        $push: { applications: userId },
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
const getApplicationsByJobId = (jobId_1, userId_1, userRole_1, ...args_1) => __awaiter(void 0, [jobId_1, userId_1, userRole_1, ...args_1], void 0, function* (jobId, userId, userRole, filters = {}, skip = 0, limit = 10) {
    var _a;
    const job = yield job_model_1.default.findById(jobId);
    if (!job)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Job not found");
    // Admin & Moderator → can view any job applications
    if (userRole !== "admin" && userRole !== "moderator") {
        // Only job owner allowed
        if (job.postedBy.toString() !== userId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to view these applications");
        }
    }
    const matchStage = { jobId: new mongoose_1.Types.ObjectId(jobId) };
    // Apply status filter
    if (filters.status) {
        matchStage.status = filters.status;
    }
    const pipeline = [
        { $match: matchStage },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
            $addFields: {
                applicantName: "$user.name",
                applicantEmail: "$user.email",
                applicantPhone: "$user.phoneNumber"
            }
        }
    ];
    // Apply keyword search
    if (filters.keyword) {
        pipeline.push({
            $match: {
                $or: [
                    { "user.name": { $regex: filters.keyword, $options: "i" } },
                    { "user.email": { $regex: filters.keyword, $options: "i" } },
                    { "user.phoneNumber": { $regex: filters.keyword, $options: "i" } },
                ]
            }
        });
    }
    // Get total count
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = yield application_model_1.default.aggregate(countPipeline);
    const total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
    // Add sorting and pagination
    pipeline.push({ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }, {
        $project: {
            _id: 1,
            jobId: 1,
            userId: 1,
            status: 1,
            resume: 1,
            createdAt: 1,
            updatedAt: 1,
            noteFromApplicant: 1,
            applicant: {
                _id: "$user._id",
                name: "$user.name",
                email: "$user.email",
                phoneNumber: "$user.phoneNumber",
            }
        }
    });
    const applications = yield application_model_1.default.aggregate(pipeline);
    const totalPages = Math.ceil(total / limit);
    const hasMore = skip + limit < total;
    return {
        applications,
        meta: {
            total,
            totalPages,
            skip,
            limit,
            hasMore,
            filteredTotal: total
        }
    };
});
/* Get Single */
const getSingleApplicationById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield application_model_1.default.findById(id)
        .populate("userId", "name email phoneNumber country state city area");
    if (!result)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Not found");
    return result;
});
const getMyApplications = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const query = { userId };
    const result = yield (0, infinitePaginate_1.infinitePaginate)(application_model_1.default, query, skip, limit, [
        {
            path: "jobId",
            select: "title company location jobType salary status",
            populate: {
                path: "company",
                select: "name logo",
            },
        },
    ]);
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
    getApplicationsByJobId,
    getSingleApplicationById,
    getMyApplications,
    updateStatus,
    deleteApplication,
};
