/* eslint-disable @typescript-eslint/no-explicit-any */
import { Report } from "./report.model";
import AppError from "../../../errors/AppError";
import httpStatus from "http-status";
import { Types } from "mongoose";

const submitReport = async (
  reporterId: string,
  payload: { targetId: string; reportType: "user" | "group"; reason: string }
) => {
  if (reporterId === payload.targetId) {
    throw new AppError(httpStatus.BAD_REQUEST, "You cannot report yourself.");
  }

  // Optional: Prevent spamming the report button (e.g., max 1 report per day per user)
  const existingReport = await Report.findOne({
    reporterId: new Types.ObjectId(reporterId),
    targetId: new Types.ObjectId(payload.targetId),
    createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
  });

  if (existingReport) {
    throw new AppError(httpStatus.BAD_REQUEST, "You have already reported this recently.");
  }

  const report = await Report.create({
    reporterId: new Types.ObjectId(reporterId),
    targetId: new Types.ObjectId(payload.targetId),
    reportType: payload.reportType,
    reason: payload.reason,
  });

  return report;
};

export const ReportServices = {
  submitReport,
};