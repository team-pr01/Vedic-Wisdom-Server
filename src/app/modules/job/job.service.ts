/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Job from "./job.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import Application from "./applications/application.model";

/* Post Job */
const postJob = async (
    payload: any,
    user: any,
    file: Express.Multer.File | undefined,
) => {
    if (typeof payload?.company === "string") {
        payload.company = JSON.parse(payload?.company);
    }

    if (typeof payload?.salary === "string") {
        payload.salary = JSON.parse(payload?.salary);
    }

    let uploadedUrl = "";

    // Upload to Cloudinary
    if (file) {
        const imageName = `job-${Date.now()}`;
        const path = file.path;

        const { secure_url } = await sendImageToCloudinary(imageName, path);
        uploadedUrl = secure_url;
    }

    // Attach file based on hiring type
    if (payload.company) {
        payload.company = {
            ...payload.company,
            logo: uploadedUrl,
        };
    }

    payload.postedBy = user?.userId;

    const result = await Job.create(payload);
    return result;
};

/* Get All Jobs */
const getAllJobs = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {};

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
            ? filters.jobType.split(',').map((item: string) => item.trim())
            : filters.jobType;

        if (jobTypes.length === 1) {
            query.jobType = jobTypes[0];
        } else if (jobTypes.length > 1) {
            query.jobType = { $in: jobTypes };
        }
    }

    // Work Mode (handle array or single value)
    if (filters.workMode) {
        const workModes = typeof filters.workMode === 'string'
            ? filters.workMode.split(',').map((item: string) => item.trim())
            : filters.workMode;

        if (workModes.length === 1) {
            query.workMode = workModes[0];
        } else if (workModes.length > 1) {
            query.workMode = { $in: workModes };
        }
    }

    // Experience Level (handle array or single value)
    if (filters.experienceLevel) {
        const experienceLevels = typeof filters.experienceLevel === 'string'
            ? filters.experienceLevel.split(',').map((item: string) => item.trim())
            : filters.experienceLevel;

        if (experienceLevels.length === 1) {
            query.experienceLevel = experienceLevels[0];
        } else if (experienceLevels.length > 1) {
            query.experienceLevel = { $in: experienceLevels };
        }
    }

    // Category (handle array or single value)
    if (filters.category) {
        const categories = typeof filters.category === 'string'
            ? filters.category.split(',').map((item: string) => item.trim())
            : filters.category;

        if (categories.length === 1) {
            query.category = categories[0];
        } else if (categories.length > 1) {
            query.category = { $in: categories };
        }
    }

    return infinitePaginate(
        Job,
        query,
        skip,
        limit,
        [] // populate array if needed later
    );
};

/* Get Single Job */
const getSingleJobById = async (jobId: string) => {
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid job ID");
    }

    const result = await Job.findById(jobId);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found");
    }

    return result;
};

/* Update Job */
const updateJob = async (
    jobId: string,
    payload: any,
    file?: Express.Multer.File
) => {
    const existing = await Job.findById(jobId);
    if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

    let uploadedUrl: string | undefined;

    if (file) {
        const imageName = `job-${Date.now()}`;
        const path = file.path;
        const { secure_url } = await sendImageToCloudinary(imageName, path);
        uploadedUrl = secure_url;
    }

    if (uploadedUrl) {
        payload["company.logo"] = uploadedUrl;
    }

    const result = await Job.findByIdAndUpdate(jobId, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

/* Delete Job */
const deleteJob = async (
    jobId: string,
    userId: string,
    userRole: string
) => {
    const existing = await Job.findById(jobId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Job not found");
    }

    // ✅ Admin & Moderator can delete any job
    if (userRole === "admin" || userRole === "moderator") {
        return await Job.findByIdAndDelete(jobId);
    }

    // ✅ Normal user → only own job
    if (existing.postedBy.toString() !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to delete this job"
        );
    }

    await Application.deleteMany({ jobId });
    await Job.findByIdAndDelete(jobId);

    return {}
};

/* Update Status */
const updateStatus = async (jobId: string, status: string) => {

    const result = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

    return result;
};

export const JobServices = {
    postJob,
    getAllJobs,
    getSingleJobById,
    updateJob,
    deleteJob,
    updateStatus,
};