/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Job from "../job.model";
import AppError from "../../../errors/AppError";
import Application from "./application.model";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";

/* Apply */
const applyOnJob = async (
  payload: any,
  userId: string,
  file?: Express.Multer.File
) => {
  const jobId = payload?.jobId;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

  // Prevent duplicate apply
  const exists = await Application.findOne({ jobId, userId });
  if (exists) throw new AppError(httpStatus.BAD_REQUEST, "Already applied");

  // Upload resume
  let resumeUrl = "";
  if (file) {
    const { secure_url } = await sendImageToCloudinary(
      `resume-${Date.now()}`,
      file.path
    );
    resumeUrl = secure_url;
  }

  const application = await Application.create({
    ...payload,
    jobId,
    userId,
    resume: resumeUrl,
  });

  // Update Job counters
  await Job.findByIdAndUpdate(jobId, {
    $inc: { applicationCount: 1 },
    $push: { applications: application._id },
  });

  return application;
};

/* Withdraw */
const withdrawApplication = async (
  applicationId: string,
  userId: string
) => {
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError(httpStatus.NOT_FOUND, "Not found");

  if (application.userId.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
  }

  application.status = "withdrawn";
  await application.save();

  // Update Job counters
  await Job.findByIdAndUpdate(application.jobId, {
    $inc: { applicationCount: -1 },
    $pull: { applications: application._id },
  });

  return application;
};

/* Get All */
const getAllApplications = async (
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  if (filters.status) {
    query.status = filters.status;
  }

  return infinitePaginate(Application, query, skip, limit, [
    { path: "jobId" },
    { path: "userId" },
  ]);
};

// Get  all applications By Job id
const getApplicationsByJob = async (
  jobId: string,
  userId: string,
  userRole: string
) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

  // ✅ Admin & Moderator → can view any job applications
  if (userRole !== "admin" && userRole !== "moderator") {
    // ✅ Only job owner allowed
    if (job.postedBy.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view these applications"
      );
    }
  }

  const applications = await Application.find({ jobId })
    .populate("userId", "name email phoneNumber")
    .sort({ createdAt: -1 });

  return applications;
};

/* Get Single */
const getSingleApplicationById = async (id: string) => {
  const result = await Application.findById(id)
    .populate("userId", "name email phoneNumber country state city area");

  if (!result) throw new AppError(httpStatus.NOT_FOUND, "Not found");
  return result;
};

/* Update Status */
const updateStatus = async (
  applicationId: string,
  status: string,
  userId: string,
  userRole: string
) => {
  const app = await Application.findById(applicationId);
  if (!app) throw new AppError(httpStatus.NOT_FOUND, "Application not found");

  const job = await Job.findById(app.jobId);
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Related job not found");

  // Authorization
  if (userRole !== "admin" && userRole !== "moderator") {
    if (job.postedBy.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to update this application"
      );
    }
  }

  // Update application status
  app.status = status as any;
  await app.save();

  // BUSINESS RULE: If hired → close job
  if (status === "hired") {
    job.status = "closed";
    await job.save();
  }

  return app;
};

/* Delete */
const deleteApplication = async (
  applicationId: string,
  userId: string,
  userRole: string
) => {
  const app = await Application.findById(applicationId);
  if (!app) throw new AppError(httpStatus.NOT_FOUND, "Application not found");

  // ✅ Admin & Moderator → delete any
  if (userRole === "admin" || userRole === "moderator") {
    await Job.findByIdAndUpdate(app.jobId, {
      $inc: { applicationCount: -1 },
      $pull: { applications: app._id },
    });

    return await Application.findByIdAndDelete(applicationId);
  }

  // ✅ User → only own application
  if (app.userId.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to delete this application"
    );
  }

  await Job.findByIdAndUpdate(app.jobId, {
    $inc: { applicationCount: -1 },
    $pull: { applications: app._id },
  });

  return await Application.findByIdAndDelete(applicationId);
};

export const ApplicationServices = {
  applyOnJob,
  withdrawApplication,
  getAllApplications,
  getApplicationsByJob,
  getSingleApplicationById,
  updateStatus,
  deleteApplication,
};