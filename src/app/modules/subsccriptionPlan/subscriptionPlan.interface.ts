import { Types } from "mongoose";

export type TBillingType = "monthly" | "yearly";
export type TPlanStatus = "active" | "draft";

export interface TSubscriptionPlan {
  _id: Types.ObjectId;
  name: string;
  description: string;
  currency: string;
  price: number;
  billingType: TBillingType;
  features: string[];
  isPopular: boolean;
  status: TPlanStatus;
  createdAt?: Date;
  updatedAt?: Date;
}