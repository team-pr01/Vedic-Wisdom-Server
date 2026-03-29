/* eslint-disable @typescript-eslint/no-explicit-any */
// services/subscriptionPlan.service.ts
import httpStatus from "http-status";
import { TSubscriptionPlan } from "./subscriptionPlan.interface";
import SubscriptionPlan from "./subscriptionPlan.model";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import AppError from "../../../errors/AppError";

// Create subscription plan
const createSubscriptionPlan = async (payload: TSubscriptionPlan) => {
    const result = await SubscriptionPlan.create(payload);
    return result;
};

// Get all subscription plans (admin - includes draft)
const getAllSubscriptionPlans = async (
    keyword?: string,
    status?: string,
    billingType?: string,
    skip = 0,
    limit = 10
) => {
    const query: any = {};

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }

    if (status) {
        query.status = status;
    }

    if (billingType) {
        query.billingType = billingType;
    }

    return infinitePaginate(SubscriptionPlan, query, skip, limit, []);
};

// Get active subscription plans (for users - only active plans)
const getActiveSubscriptionPlans = async (
    keyword?: string,
    billingType?: string,
    skip = 0,
    limit = 10
) => {
    const query: any = { status: "active" };

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }

    if (billingType) {
        query.billingType = billingType;
    }

    return infinitePaginate(SubscriptionPlan, query, skip, limit, []);
};

// Get single subscription plan
const getSingleSubscriptionPlan = async (planId: string) => {
    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    return plan;
};

// Update subscription plan
const updateSubscriptionPlan = async (
    planId: string,
    payload: Partial<TSubscriptionPlan>
) => {
    const existing = await SubscriptionPlan.findById(planId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    const result = await SubscriptionPlan.findByIdAndUpdate(planId, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// Delete subscription plan
const deleteSubscriptionPlan = async (planId: string) => {
    const existing = await SubscriptionPlan.findById(planId);

    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    const result = await SubscriptionPlan.findByIdAndDelete(planId);
    return result;
};

export const SubscriptionPlanServices = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getActiveSubscriptionPlans,
    getSingleSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
};