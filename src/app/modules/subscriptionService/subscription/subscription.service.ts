/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { TSubscription } from "./subscription.interface";
import Subscription from "./subscription.model";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import AppError from "../../../errors/AppError";
import SubscriptionPlan from "../subsccriptionPlan/subscriptionPlan.model";
import config from "../../../config";
import { generateTransactionId } from "../../../utils/generateTransactionId";
import axios from "axios";
import { User } from "../../auth/auth.model";
import { getCurrencyCode } from "../../../utils/getCurrencyCode";

// 1. Initialize SSL Commerz Payment for Subscription
const initiateSubscriptionPayment = async (userId: string, payload: any) => {
    const plan = await SubscriptionPlan.findById(payload.planId);
    if (!plan) {
        throw new AppError(httpStatus.NOT_FOUND, "Subscription plan not found");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    // 1. Determine price based on payload.billingType (monthly or yearly)
    let amount = plan.monthlyPrice; // Default to monthly
    if (payload.billingType === "yearly") {
        amount = plan.yearlyPrice;
    }

    const transactionId = generateTransactionId();

    // Create a pending transaction record
    const transaction = await Subscription.create({
        userId,
        plan: plan._id,
        transactionId,
        status: "pending",
        billingType: payload.billingType, // Save for later date calculation
        startDate: new Date(), // Temp dates to satisfy schema requirement
        endDate: new Date(),   // Will be overwritten upon success
    });

    const storeId = config.store_id;
    const storePassword = config.store_passwd;

    const postData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: amount,
        currency: getCurrencyCode(plan.currency) || "BDT",
        tran_id: transactionId,
        success_url: `${config.backend_url}/api/v1/subscription/payment/success?tran_id=${transactionId}`,
        fail_url: `${config.backend_url}/api/v1/subscription/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${config.backend_url}/api/v1/subscription/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${config.backend_url}/api/v1/subscription/payment/ipn`,
        cus_name: user.name || "Customer",
        cus_email: user.email,
        cus_phone: user.phoneNumber || "",
        cus_add1: "N/A",
        cus_city: "N/A",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: `${plan.name} Plan (${payload.billingType})`,
        product_category: "Subscription",
        product_profile: "non-physical-goods",
    };

    try {
        const response = await axios.post(
            "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
            new URLSearchParams(postData as any).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );
        console.log(response);

        if (response.data && response.data.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: response.data.GatewayPageURL,
            };
        } else {
            transaction.status = "failed";
            await transaction.save();
            throw new AppError(httpStatus.BAD_REQUEST, "Payment initiation failed");
        }
    } catch (error: any) {
        console.log(error);
        if (error.response?.data?.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: error.response.data.GatewayPageURL,
            };
        }
        transaction.status = "failed";
        await transaction.save();
        throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Payment initiation failed");
    }
};

// 2. Handle Successful Payment & Activate Subscription
const handleSubscriptionPaymentSuccess = async (tranId: string) => {
    const transaction = await Subscription.findOne({ transactionId: tranId });

    if (!transaction) {
        throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    if (transaction.status === "active") {
        return { success: true, message: "Transaction already processed" };
    }

    // Mark transaction as active
    transaction.status = "active";

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();

    // 2. Use the billingType saved during initiation
    if (transaction.billingType === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
    } else if (transaction.billingType === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // Update transaction with the calculated dates
    transaction.startDate = startDate;
    transaction.endDate = endDate;
    await transaction.save();

    await User.findByIdAndUpdate(
        transaction.userId,
        { $set: { isSubscribedUser: true } },
        { new: true }
    );

    const plan = await SubscriptionPlan.findById(transaction.plan);
    if (!plan) throw new AppError(httpStatus.NOT_FOUND, "Plan not found");

    // Send Notification
    // sendSingleNotification(
    //     transaction.userId as any,
    //     "Subscription Confirmed!",
    //     `You have successfully subscribed to the ${plan.name} (${transaction.billingType}) plan.`,
    //     undefined,
    //     undefined
    // );

    return { success: true, subscription: transaction };
};

// 3. Handle Failed Payment
const handleSubscriptionPaymentFailure = async (tranId: string) => {
    const transaction = await Subscription.findOne({ transactionId: tranId });
    if (!transaction) throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");

    if (transaction.status === "pending") {
        transaction.status = "failed";
        await transaction.save();
    }
    return { success: false, message: "Payment failed" };
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

    return infinitePaginate(Subscription, query, skip, limit, ["plan"]);
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
    // sendSingleNotification(
    //     userId as any,
    //     "Subscription Cancelled!",
    //     `You have successfully cancelled your ${existing?.plan?.name} plan.`,
    //     undefined,
    //     undefined
    // );

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
    // sendSingleNotification(
    //     userId as any,
    //     "Subscription Renewed!",
    //     `Your subscription (${existing?.plan?.name}) has been renewed.`,
    //     undefined,
    //     undefined
    // );

    return result;
};

export const SubscriptionServices = {
    initiateSubscriptionPayment,
    handleSubscriptionPaymentSuccess,
    handleSubscriptionPaymentFailure,
    getAllSubscriptions,
    getMySubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    renewSubscription,
};