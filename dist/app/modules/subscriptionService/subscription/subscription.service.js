"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const subscription_model_1 = __importDefault(require("./subscription.model"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const subscriptionPlan_model_1 = __importDefault(require("../subsccriptionPlan/subscriptionPlan.model"));
const config_1 = __importDefault(require("../../../config"));
const generateTransactionId_1 = require("../../../utils/generateTransactionId");
const axios_1 = __importDefault(require("axios"));
const auth_model_1 = require("../../auth/auth.model");
const getCurrencyCode_1 = require("../../../utils/getCurrencyCode");
// 1. Initialize SSL Commerz Payment for Subscription
const initiateSubscriptionPayment = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const plan = yield subscriptionPlan_model_1.default.findById(payload.planId);
    if (!plan) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription plan not found");
    }
    const user = yield auth_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    // 1. Determine price based on payload.billingType (monthly or yearly)
    let amount = plan.monthlyPrice; // Default to monthly
    if (payload.billingType === "yearly") {
        amount = plan.yearlyPrice;
    }
    const transactionId = (0, generateTransactionId_1.generateTransactionId)();
    // Create a pending transaction record
    const transaction = yield subscription_model_1.default.create({
        userId,
        plan: plan._id,
        transactionId,
        status: "pending",
        billingType: payload.billingType, // Save for later date calculation
        startDate: new Date(), // Temp dates to satisfy schema requirement
        endDate: new Date(), // Will be overwritten upon success
    });
    const storeId = config_1.default.store_id;
    const storePassword = config_1.default.store_passwd;
    const postData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: amount,
        currency: (0, getCurrencyCode_1.getCurrencyCode)(plan.currency) || "BDT",
        tran_id: transactionId,
        success_url: `${config_1.default.backend_url}/api/v1/subscription/payment/success?tran_id=${transactionId}`,
        fail_url: `${config_1.default.backend_url}/api/v1/subscription/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${config_1.default.backend_url}/api/v1/subscription/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${config_1.default.backend_url}/api/v1/subscription/payment/ipn`,
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
        const response = yield axios_1.default.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", new URLSearchParams(postData).toString(), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
        console.log(response);
        if (response.data && response.data.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: response.data.GatewayPageURL,
            };
        }
        else {
            transaction.status = "failed";
            yield transaction.save();
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Payment initiation failed");
        }
    }
    catch (error) {
        console.log(error);
        if (((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.status) === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: error.response.data.GatewayPageURL,
            };
        }
        transaction.status = "failed";
        yield transaction.save();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, (error === null || error === void 0 ? void 0 : error.message) || "Payment initiation failed");
    }
});
// 2. Handle Successful Payment & Activate Subscription
const handleSubscriptionPaymentSuccess = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield subscription_model_1.default.findOne({ transactionId: tranId }).populate("plan");
    if (!transaction) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
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
    }
    else if (transaction.billingType === "yearly") {
        endDate.setFullYear(endDate.getFullYear() + 1);
    }
    // Update transaction with the calculated dates
    transaction.startDate = startDate;
    transaction.endDate = endDate;
    yield transaction.save();
    const plan = yield subscriptionPlan_model_1.default.findById(transaction.plan);
    if (!plan)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Plan not found");
    yield auth_model_1.User.findByIdAndUpdate(transaction.userId, { $set: { isSubscribedUser: true, plan: plan.name } }, { new: true });
    // Send Notification
    // sendSingleNotification(
    //     transaction.userId as any,
    //     "Subscription Confirmed!",
    //     `You have successfully subscribed to the ${plan.name} (${transaction.billingType}) plan.`,
    //     undefined,
    //     undefined
    // );
    return { success: true, subscription: transaction };
});
// 3. Handle Failed Payment
const handleSubscriptionPaymentFailure = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield subscription_model_1.default.findOne({ transactionId: tranId });
    if (!transaction)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    if (transaction.status === "pending") {
        transaction.status = "failed";
        yield transaction.save();
    }
    return { success: false, message: "Payment failed" };
});
// Get all subscriptions (admin)
const getAllSubscriptions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }
    return (0, infinitePaginate_1.infinitePaginate)(subscription_model_1.default, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
});
// Get user's subscriptions
const getMySubscriptions = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const query = { userId };
    return (0, infinitePaginate_1.infinitePaginate)(subscription_model_1.default, query, skip, limit, ["plan"]);
});
// Get single subscription
const getSingleSubscription = (subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    const subscription = yield subscription_model_1.default.findById(subscriptionId).populate("userId", "name email phoneNumber");
    if (!subscription) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found");
    }
    return subscription;
});
// Update subscription
const updateSubscription = (subscriptionId, payload, userId, userRole) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subscription_model_1.default.findById(subscriptionId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found");
    }
    // Check permission
    if (userRole !== "admin" && userRole !== "moderator") {
        if (existing.userId.toString() !== userId) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to update this subscription");
        }
    }
    const result = yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete subscription
const deleteSubscription = (subscriptionId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subscription_model_1.default.findById(subscriptionId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found");
    }
    const result = yield subscription_model_1.default.findByIdAndDelete(subscriptionId);
    return result;
});
// Cancel subscription
const cancelSubscription = (subscriptionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subscription_model_1.default.findById(subscriptionId).populate("plan", "name");
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found");
    }
    if (existing.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to cancel this subscription");
    }
    if (existing.status !== "active") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Only active subscriptions can be cancelled");
    }
    const result = yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
        status: "cancelled",
        cancelledAt: new Date(),
        autoRenew: false,
    }, { new: true });
    // Send notification to user
    // sendSingleNotification(
    //     userId as any,
    //     "Subscription Cancelled!",
    //     `You have successfully cancelled your ${existing?.plan?.name} plan.`,
    //     undefined,
    //     undefined
    // );
    return result;
});
// Renew subscription
const renewSubscription = (subscriptionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const existing = yield subscription_model_1.default.findById(subscriptionId).populate("plan", "name billingType");
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription not found");
    }
    if (existing.userId.toString() !== userId) {
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, "You are not allowed to renew this subscription");
    }
    // Calculate new end date based on billing cycle
    const newStartDate = new Date();
    const newEndDate = new Date();
    switch ((_a = existing === null || existing === void 0 ? void 0 : existing.plan) === null || _a === void 0 ? void 0 : _a.billingType) {
        case "monthly":
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            break;
        case "yearly":
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
            break;
    }
    const result = yield subscription_model_1.default.findByIdAndUpdate(subscriptionId, {
        status: "active",
        startDate: newStartDate,
        endDate: newEndDate,
        cancelledAt: null,
    }, { new: true });
    // Send notification to user
    // sendSingleNotification(
    //     userId as any,
    //     "Subscription Renewed!",
    //     `Your subscription (${existing?.plan?.name}) has been renewed.`,
    //     undefined,
    //     undefined
    // );
    return result;
});
exports.SubscriptionServices = {
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
