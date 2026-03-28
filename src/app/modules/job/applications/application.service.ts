/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Job from "../job.model";
import AppError from "../../../errors/AppError";
import Application from "./application.model";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { Types } from "mongoose";

/* Apply */
const applyOnJob = async (
  payload: any,
  userId: string,
) => {
  const jobId = payload?.jobId;
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

  // Prevent duplicate apply
  const exists = await Application.findOne({ jobId, userId });
  if (exists) throw new AppError(httpStatus.BAD_REQUEST, "You have already applied for this job.");

  const application = await Application.create({
    ...payload,
    jobId,
    userId
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
const getApplicationsByJobId = async (
  jobId: string,
  userId: string,
  userRole: string,
  filters: any = {},
  skip = 0,
  limit = 10
) => {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError(httpStatus.NOT_FOUND, "Job not found");

  // Admin & Moderator → can view any job applications
  if (userRole !== "admin" && userRole !== "moderator") {
    // Only job owner allowed
    if (job.postedBy.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not allowed to view these applications"
      );
    }
  }

  const matchStage: any = { jobId: new Types.ObjectId(jobId) };

  // Apply status filter
  if (filters.status) {
    matchStage.status = filters.status;
  }

  const pipeline: any[] = [
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
  const countResult = await Application.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Add sorting and pagination
  pipeline.push(
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        _id: 1,
        jobId: 1,
        userId: 1,
        status: 1,
        resume: 1,
        createdAt: 1,
        updatedAt: 1,
        noteFromApplicant : 1,
        applicant: {
          _id: "$user._id",
          name: "$user.name",
          email: "$user.email",
          phoneNumber: "$user.phoneNumber",
        }
      }
    }
  );

  const applications = await Application.aggregate(pipeline);

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
  getApplicationsByJobId,
  getSingleApplicationById,
  updateStatus,
  deleteApplication,
};