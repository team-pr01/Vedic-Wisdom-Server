/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import mongoose from "mongoose";
import AppError from "../../errors/AppError";
import Job from "./job.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";

/* Post Job */
const postJob = async (
    payload: any,
    user: any,
    file: Express.Multer.File | undefined,
) => {
    if (typeof payload?.individual === "string") {
        payload.individual = JSON.parse(payload?.individual);
    }

    if (typeof payload?.company === "string") {
        payload.company = JSON.parse(payload?.company);
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
    if (payload.hiringType === "company") {
        payload.company = {
            ...payload.company,
            logo: uploadedUrl,
        };
    }

    if (payload.hiringType === "individual") {
        payload.individual = {
            ...payload.individual,
            identityDocument: uploadedUrl,
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
        query["location.city"] = filters.city.trim();
    }

    // State
    if (filters.state) {
        query["location.state"] = filters.state.trim();
    }

    // Country
    if (filters.country) {
        query["location.country"] = filters.country.trim();
    }

    // Job Type
    if (filters.jobType) {
        query.jobType = filters.jobType;
    }

    // Work Mode
    if (filters.workMode) {
        query.workMode = filters.workMode;
    }

    // Experience Level
    if (filters.experienceLevel) {
        query.experienceLevel = filters.experienceLevel;
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

  // ✅ Update nested image safely
  if (uploadedUrl) {
    if (existing.hiringType === "company") {
      payload["company.logo"] = uploadedUrl;
    }
    if (existing.hiringType === "individual") {
      payload["individual.identityDocument"] = uploadedUrl;
    }
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

  return await Job.findByIdAndDelete(jobId);
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