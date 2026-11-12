import { Types } from "mongoose";

export type TReportType = "user" | "group";
export type TReportStatus = "pending" | "resolved" | "dismissed";

export type TReport = {
  reporterId: Types.ObjectId; // Who is reporting
  targetId: Types.ObjectId;   // Who or what is being reported (UserId, ConversationId, etc.)
  reportType: TReportType;
  reason: string;             // The description/reason provided by user
  status: TReportStatus;
  createdAt?: Date;
  updatedAt?: Date;
};