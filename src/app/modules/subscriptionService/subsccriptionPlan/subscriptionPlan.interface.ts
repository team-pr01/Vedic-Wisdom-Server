import { Types } from "mongoose";

export type TPlanStatus = "active" | "draft";

export interface TSubscriptionPlan {
  _id: Types.ObjectId;
  name: string;
  description: string;
  currency: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  isPopular: boolean;
  status: TPlanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}