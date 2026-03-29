import { ObjectId } from "mongoose";

export type TSubscriptionStatus = "active" | "expired" | "cancelled";

export interface TSubscription {
    _id: ObjectId;
    plan: ObjectId;
    userId: ObjectId;
    status: TSubscriptionStatus;
    startDate: Date;
    endDate: Date;
    cancelledAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}