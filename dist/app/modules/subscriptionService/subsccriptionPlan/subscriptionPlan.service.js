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
exports.SubscriptionPlanServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
// services/subscriptionPlan.service.ts
const http_status_1 = __importDefault(require("http-status"));
const subscriptionPlan_model_1 = __importDefault(require("./subscriptionPlan.model"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
// Create subscription plan
const createSubscriptionPlan = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriptionPlan_model_1.default.create(payload);
    return result;
});
// Get all subscription plans (admin - includes draft)
const getAllSubscriptionPlans = (keyword_1, status_1, billingType_1, ...args_1) => __awaiter(void 0, [keyword_1, status_1, billingType_1, ...args_1], void 0, function* (keyword, status, billingType, skip = 0, limit = 10) {
    const query = {};
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
    return (0, infinitePaginate_1.infinitePaginate)(subscriptionPlan_model_1.default, query, skip, limit, []);
});
// Get active subscription plans (for users - only active plans)
const getActiveSubscriptionPlans = (keyword_1, billingType_1, ...args_1) => __awaiter(void 0, [keyword_1, billingType_1, ...args_1], void 0, function* (keyword, billingType, skip = 0, limit = 10) {
    const query = { status: "active" };
    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
        ];
    }
    if (billingType) {
        query.billingType = billingType;
    }
    return (0, infinitePaginate_1.infinitePaginate)(subscriptionPlan_model_1.default, query, skip, limit, []);
});
// Get single subscription plan
const getSingleSubscriptionPlan = (planId) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = yield subscriptionPlan_model_1.default.findById(planId);
    if (!plan) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription plan not found");
    }
    return plan;
});
// Update subscription plan
const updateSubscriptionPlan = (planId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subscriptionPlan_model_1.default.findById(planId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription plan not found");
    }
    const result = yield subscriptionPlan_model_1.default.findByIdAndUpdate(planId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
// Delete subscription plan
const deleteSubscriptionPlan = (planId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield subscriptionPlan_model_1.default.findById(planId);
    if (!existing) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Subscription plan not found");
    }
    const result = yield subscriptionPlan_model_1.default.findByIdAndDelete(planId);
    return result;
});
exports.SubscriptionPlanServices = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getActiveSubscriptionPlans,
    getSingleSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
};
