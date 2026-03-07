import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { JobServices } from "./job.service";

// Post Job
const postJob = catchAsync(async (req, res) => {
    const file = req.file;
    const user = req.user;

    const result = await JobServices.postJob(req.body, user, file);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Job posted successfully",
        data: result,
    });
});

// Get All Jobs
const getAllJobs = catchAsync(async (req, res) => {
    const {
        keyword,
        status,
        city,
        state,
        country,
        jobType,
        workMode,
        experienceLevel,
        skip = "0",
        limit = "10",
    } = req.query;

    const filters = {
        keyword: keyword as string,
        status: status as string,
        city: city as string,
        state: state as string,
        country: country as string,
        jobType: jobType as string,
        workMode: workMode as string,
        experienceLevel: experienceLevel as string,
    };

    const result = await JobServices.getAllJobs(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Jobs fetched successfully",
        data: {
            jobs: result.data,
            meta: result.meta,
        },
    });
});

// Get Single Job
const getSingleJobById = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const result = await JobServices.getSingleJobById(jobId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Job fetched successfully",
        data: result,
    });
});

// Update Job
const updateJob = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const file = req.file;

    if (typeof req.body.company === "string") {
        req.body.company = JSON.parse(req.body.company);
    }
    if (typeof req.body.individual === "string") {
        req.body.individual = JSON.parse(req.body.individual);
    }

    const result = await JobServices.updateJob(jobId, req.body, file);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Job updated successfully",
        data: result,
    });
});

// Delete Job
const deleteJob = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { userId, role } = req.user;

  const result = await JobServices.deleteJob(jobId, userId, role);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Job deleted successfully",
    data: result,
  });
});

// Update Status
const updateStatus = catchAsync(async (req, res) => {
    const { jobId } = req.params;
    const { status } = req.body;

    const result = await JobServices.updateStatus(jobId, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Job status updated successfully",
        data: result,
    });
});

export const JobControllers = {
    postJob,
    getAllJobs,
    getSingleJobById,
    updateJob,
    deleteJob,
    updateStatus,
};