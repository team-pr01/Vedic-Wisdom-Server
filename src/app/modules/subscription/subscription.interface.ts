import { Types } from "mongoose";

export type TSubscriptionStatus = "active" | "expired" | "cancelled";

export interface TSubscription {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  plan: string;
  status: TSubscriptionStatus;
  billingCycle: string;
  currency: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  cancelledAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}