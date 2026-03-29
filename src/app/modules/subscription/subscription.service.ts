/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TSubscription } from "./subscription.interface";
import Subscription from "./subscription.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import AppError from "../../errors/AppError";
import SubscriptionPlan from "../subsccriptionPlan/subscriptionPlan.model";
import { sendSingleNotification } from "../../utils/sendSingleNotification";

// Create subscription
const createSubscription = async (payload: TSubscription, userId: string) => {
    const plan = await SubscriptionPlan.findById(payload.plan);

    const payloadData = {
        ...payload,
        userId,
        startDate: new Date(),
        endDate: plan?.billingType === "monthly" ? new Date(new Date().setMonth(new Date().getMonth() + 1)) :
            plan?.billingType === "yearly" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) :
                new Date(),
        status: "active",
    };

    const result = await Subscription.create(payloadData);

    // Send notification to user
    sendSingleNotification(
        userId as any,
        "Subscription Confirmed!",
        `You have successfully subscribed to the ${plan?.name} plan. Your subscription is now active.`,
        undefined,
        undefined
    );

    return result;
};

// Get all subscriptions (admin)
const getAllSubscriptions = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {};

    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }

    return infinitePaginate(Subscription, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
};

// Get user's subscriptions
const getMySubscriptions = async (
    userId: string,
    skip = 0,
    limit = 10
) => {
    const query: any = { userId };

    return infinitePaginate(Subscription, query, skip, limit, []);
};

// Get single subscription
const getSingleSubscription = async (subscriptionId: string) => {
    const subscription = await Subscription.findById(subscriptionId).populate(
        "userId",
        "name email phoneNumber"
    );

    if (!subscription) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
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
const deleteSubscription = async (subscriptionId: string) => {
    const existing = await Subscription.findById(subscriptionId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription not found");
    }

    const result = await Subscription.findByIdAndDelete(subscriptionId);
    return result;
};

// Cancel subscription
const cancelSubscription = async (subscriptionId: string, userId: string) => {
    const existing = await Subscription.findById(subscriptionId).populate("plan", "name") as any;

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

    // Send notification to user
    sendSingleNotification(
        userId as any,
        "Subscription Cancelled!",
        `You have successfully cancelled your ${existing?.plan?.name} plan.`,
        undefined,
        undefined
    );

    return result;
};

// Renew subscription
const renewSubscription = async (subscriptionId: string, userId: string) => {
    const existing = await Subscription.findById(subscriptionId).populate("plan", "name billingType") as any;

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
    const newEndDate = new Date();

    switch (existing?.plan?.billingType) {
        case "monthly":
            newEndDate.setMonth(newEndDate.getMonth() + 1);
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

    // Send notification to user
    sendSingleNotification(
        userId as any,
        "Subscription Renewed!",
        `Your subscription (${existing?.plan?.name}) has been renewed.`,
        undefined,
        undefined
    );

    return result;
};

export const SubscriptionServices = {
    createSubscription,
    getAllSubscriptions,
    getMySubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    renewSubscription,
};