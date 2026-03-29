/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TSubscription } from "./subscription.interface";
import Subscription from "./subscription.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import AppError from "../../errors/AppError";

// Create subscription
const createSubscription = async (payload: TSubscription, userId: string) => {
    const payloadData = {
        ...payload,
        userId,
        startDate: new Date(),
        endDate: payload?.billingCycle === "monthly" ? new Date(new Date().setMonth(new Date().getMonth() + 1)) :
            payload?.billingCycle === "quarterly" ? new Date(new Date().setMonth(new Date().getMonth() + 3)) :
                payload?.billingCycle === "yearly" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) :
                    new Date(),
    };

    const result = await Subscription.create(payloadData);
    return result;
};

// Get all subscriptions (admin)
const getAllSubscriptions = async (
    keyword?: string,
    status?: string,
    plan?: string,
    skip = 0,
    limit = 10
) => {
    const query: any = {};

    if (keyword) {
        query.$or = [
            { plan: { $regex: keyword, $options: "i" } },
            { paymentId: { $regex: keyword, $options: "i" } },
            { features: { $regex: keyword, $options: "i" } },
        ];
    }

    if (status) {
        query.status = status;
    }

    if (plan) {
        query.plan = plan;
    }

    return infinitePaginate(Subscription, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
};

// Get user's subscriptions
const getUserSubscriptions = async (
    userId: string,
    skip = 0,
    limit = 10
) => {
    const query: any = { userId };

    return infinitePaginate(Subscription, query, skip, limit, []);
};

// Get single subscription
const getSingleSubscription = async (subscriptionId: string, userId?: string, userRole?: string) => {
    const subscription = await Subscription.findById(subscriptionId).populate(
        "userId",
        "name email phoneNumber"
    );

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Check permission
    if (userRole !== "admin" && userRole !== "moderator") {
        if (subscription.userId._id.toString() !== userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to view this subscription"
            );
        }
    }

    return subscription;
};

// Update subscription
const updateSubscription = async (
    subscriptionId: string,
    payload: Partial<TSubscription>,
    userId: string,
    userRole: string
) => {
    const existing = await Subscription.findById(subscriptionId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Check permission
    if (userRole !== "admin" && userRole !== "moderator") {
        if (existing.userId.toString() !== userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to update this subscription"
            );
        }
    }

    const result = await Subscription.findByIdAndUpdate(subscriptionId, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// Delete subscription
const deleteSubscription = async (subscriptionId: string, userId: string, userRole: string) => {
    const existing = await Subscription.findById(subscriptionId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    // Check permission
    if (userRole !== "admin" && userRole !== "moderator") {
        if (existing.userId.toString() !== userId) {
            throw new AppError(
                httpStatus.FORBIDDEN,
                "You are not allowed to delete this subscription"
            );
        }
    }

    const result = await Subscription.findByIdAndDelete(subscriptionId);
    return result;
};

// Cancel subscription
const cancelSubscription = async (subscriptionId: string, userId: string) => {
    const existing = await Subscription.findById(subscriptionId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    if (existing.userId.toString() !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to cancel this subscription"
        );
    }

    if (existing.status !== "active") {
        throw new AppError(httpStatus.BAD_REQUEST, "Only active subscriptions can be cancelled");
    }

    const result = await Subscription.findByIdAndUpdate(
        subscriptionId,
        {
            status: "cancelled",
            cancelledAt: new Date(),
            autoRenew: false,
        },
        { new: true }
    );

    return result;
};

// Renew subscription
const renewSubscription = async (subscriptionId: string, userId: string) => {
    const existing = await Subscription.findById(subscriptionId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    if (existing.userId.toString() !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "You are not allowed to renew this subscription"
        );
    }

    // Calculate new end date based on billing cycle
    const newStartDate = new Date();
    let newEndDate = new Date();

    switch (existing.billingCycle) {
        case "monthly":
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            break;
        case "quarterly":
            newEndDate.setMonth(newEndDate.getMonth() + 3);
            break;
        case "yearly":
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            break;
    }

    const result = await Subscription.findByIdAndUpdate(
        subscriptionId,
        {
            status: "active",
            startDate: newStartDate,
            endDate: newEndDate,
            cancelledAt: null,
        },
        { new: true }
    );

    return result;
};

export const SubscriptionServices = {
    createSubscription,
    getAllSubscriptions,
    getUserSubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    renewSubscription,
};