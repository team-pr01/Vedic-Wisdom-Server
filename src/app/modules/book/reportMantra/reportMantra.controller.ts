import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ReportMantraService } from "./reportMantra.services";
import AppError from "../../../errors/AppError";

// Create a new reported mantra
const reportMantra = catchAsync(async (req: Request, res: Response) => {
  const result = await ReportMantraService.reportMantra(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Mantra reported successfully",
    data: result,
  });
});

// Get all reported mantras
const getAllReportedMantras = catchAsync(async (req: Request, res: Response) => {
  const { status } = req.query;
  const result = await ReportMantraService.getAllReportedMantras(status);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All reported mantras fetched successfully",
    data: result,
  });
});

// Get a single reported mantra by ID
const getSingleReportedMantra = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;
  const result = await ReportMantraService.getSingleReportedMantra(reportId);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Reported mantra not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reported mantra fetched successfully",
    data: result,
  });
});

// Update report status (mark as human verified)
const updateReportStatus = catchAsync(async (req: Request, res: Response) => {
  const { reportId } = req.params;

  const result = await ReportMantraService.updateReportStatus(reportId, req.body);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Reported mantra not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Report marked as human verified successfully",
    data: result,
  });
});

const resolveIssue = catchAsync(async (req: Request, res: Response) => {
  const { textId } = req.params;
  const { langCode, translation } = req.body;

  if (!textId || !langCode || !translation) {
    throw new AppError(httpStatus.BAD_REQUEST, "textId, langCode, and translation are required");
  }

  const result = await ReportMantraService.resolveIssue(textId, req.body);

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Book text not found");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Translation updated successfully",
    data: result,
  });
});

// Delete Reported Mantra
const deleteReportedMantra = catchAsync(async (req, res) => {
  const { reportId } = req.params;
  const result = await ReportMantraService.deleteReportedMantra(reportId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reported mantra deleted successfully",
    data: result,
  });
});


export const ReportMantraController = {
  reportMantra,
  getAllReportedMantras,
  getSingleReportedMantra,
  updateReportStatus,
  resolveIssue,
  deleteReportedMantra
};
