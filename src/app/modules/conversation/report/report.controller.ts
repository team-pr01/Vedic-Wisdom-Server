import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ReportServices } from "./report.service";

const submitReport = catchAsync(async (req, res) => {
  const reporterId = req.user.userId;
  const { targetId, reportType, reason } = req.body;

  const result = await ReportServices.submitReport(reporterId, {
    targetId,
    reportType,
    reason,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Report submitted successfully. Our team will review it.",
    data: result,
  });
});

export const ReportControllers = {
  submitReport,
};