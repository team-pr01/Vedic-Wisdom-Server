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
const sendSingleNotification_1 = require("../../../utils/sendSingleNotification");
// Create subscription
const createSubscription = (payload, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield subscriptionPlan_model_1.default.findById(payload.plan);
    const payloadData = Object.assign(Object.assign({}, payload), { userId, startDate: new Date(), endDate: (plan === null || plan === void 0 ? void 0 : plan.billingType) === "monthly" ? new Date(new Date().setMonth(new Date().getMonth() + 1)) :
            (plan === null || plan === void 0 ? void 0 : plan.billingType) === "yearly" ? new Date(new Date().setFullYear(new Date().getFullYear() + 1)) :
                new Date(), status: "active" });
    const result = yield subscription_model_1.default.create(payloadData);
    // Send notification to user
    (0, sendSingleNotification_1.sendSingleNotification)(userId, "Subscription Confirmed!", `You have successfully subscribed to the ${plan === null || plan === void 0 ? void 0 : plan.name} plan. Your subscription is now active.`, undefined, undefined);
    return result;
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
    return (0, infinitePaginate_1.infinitePaginate)(subscription_model_1.default, query, skip, limit, []);
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
    var _a;
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
    (0, sendSingleNotification_1.sendSingleNotification)(userId, "Subscription Cancelled!", `You have successfully cancelled your ${(_a = existing === null || existing === void 0 ? void 0 : existing.plan) === null || _a === void 0 ? void 0 : _a.name} plan.`, undefined, undefined);
    return result;
});
// Renew subscription
const renewSubscription = (subscriptionId, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
    (0, sendSingleNotification_1.sendSingleNotification)(userId, "Subscription Renewed!", `Your subscription (${(_b = existing === null || existing === void 0 ? void 0 : existing.plan) === null || _b === void 0 ? void 0 : _b.name}) has been renewed.`, undefined, undefined);
    return result;
});
exports.SubscriptionServices = {
    createSubscription,
    getAllSubscriptions,
    getMySubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    renewSubscription,
};
