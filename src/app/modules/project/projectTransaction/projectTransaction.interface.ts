/* eslint-disable @typescript-eslint/no-explicit-any */
// donationTransaction.interface.ts
import { Types } from "mongoose";

export type TProjectTransaction = {
  projectId: Types.ObjectId;
  userId?: Types.ObjectId;
  donorName: string;
  phoneNumber: string;
  amount: number;
  currency?: string;
  transactionId: string;
  status: "pending" | "paid" | "failed" | "cancelled";
  paymentGatewayData?: Record<string, any>;
};