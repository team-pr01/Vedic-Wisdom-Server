import { ObjectId } from "mongoose";

export type TSubscriptionStatus = "active" | "expired" | "cancelled" | "pending" | "failed";

export interface TSubscription {
    _id: ObjectId;
    plan: ObjectId;
    userId: ObjectId;
    status: TSubscriptionStatus;
    billingType: "monthly" | "yearly";
    startDate: Date;
    endDate: Date;
    transactionId?: string;
    cancelledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}