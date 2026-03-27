import httpStatus from "http-status";
import { ApplicationServices } from "./application.service";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

// Apply
const applyOnJob = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await ApplicationServices.applyOnJob(
    req.body,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Applied successfully",
    data: result,
  });
});

// Withdraw
const withdrawApplication = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const userId = req.user.userId;

  const result = await ApplicationServices.withdrawApplication(
    applicationId,
    userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Application withdrawn",
    data: result,
  });
});

// Get All
const getAllApplications = catchAsync(async (req, res) => {
  const { keyword, status, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    status: status as string,
  };

  const result = await ApplicationServices.getAllApplications(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Applications fetched",
    data: result,
  });
});

// Get  all applications By Job id
const getApplicationsByJobId = catchAsync(async (req, res) => {
  const { jobId } = req.params;
  const { userId, role } = req.user;

  const { keyword, status, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    status: status as string,
  };

  const result = await ApplicationServices.getApplicationsByJobId(
    jobId,
    userId,
    role,
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Applications fetched successfully",
    data: result,
  });
});

// Get Single
const getSingleApplicationById = catchAsync(async (req, res) => {
  const { applicationId } = req.params;

  const result = await ApplicationServices.getSingleApplicationById(
    applicationId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Application fetched",
    data: result,
  });
});

// Update Status
const updateStatus = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const { userId, role } = req.user;

  const result = await ApplicationServices.updateStatus(
    applicationId,
    status,
    userId,
    role
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Application status updated successfully",
    data: result,
  });
});

//  Delete
const deleteApplication = catchAsync(async (req, res) => {
  const { applicationId } = req.params;
  const { userId, role } = req.user;

  const result = await ApplicationServices.deleteApplication(
    applicationId,
    userId,
    role
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Application deleted successfully",
    data: result,
  });
});

export const ApplicationControllers = {
  applyOnJob,
  withdrawApplication,
  getAllApplications,
  getApplicationsByJobId,
  getSingleApplicationById,
  updateStatus,
  deleteApplication,
};