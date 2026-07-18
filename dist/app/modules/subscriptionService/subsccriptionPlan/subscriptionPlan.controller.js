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
exports.SubscriptionPlanController = void 0;
// controllers/subscriptionPlan.controller.ts
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const subscriptionPlan_service_1 = require("./subscriptionPlan.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
// Create subscription plan
const createSubscriptionPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.createSubscriptionPlan(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Subscription plan created successfully",
        data: result,
    });
}));
// Get all subscription plans (admin)
const getAllSubscriptionPlans = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, status, billingType, skip = "0", limit = "10" } = req.query;
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.getAllSubscriptionPlans(keyword, status, billingType, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All subscription plans fetched successfully",
        data: {
            plans: result.data,
            meta: result.meta,
        },
    });
}));
// Get active subscription plans (for users)
const getActiveSubscriptionPlans = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, billingType, skip = "0", limit = "10" } = req.query;
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.getActiveSubscriptionPlans(keyword, billingType, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Active subscription plans fetched successfully",
        data: {
            plans: result.data,
            meta: result.meta,
        },
    });
}));
// Get single subscription plan
const getSingleSubscriptionPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.getSingleSubscriptionPlan(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription plan fetched successfully",
        data: result,
    });
}));
// Update subscription plan
const updateSubscriptionPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.updateSubscriptionPlan(id, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription plan updated successfully",
        data: result,
    });
}));
// Delete subscription plan
const deleteSubscriptionPlan = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscriptionPlan_service_1.SubscriptionPlanServices.deleteSubscriptionPlan(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription plan deleted successfully",
        data: result,
    });
}));
exports.SubscriptionPlanController = {
    createSubscriptionPlan,
    getAllSubscriptionPlans,
    getActiveSubscriptionPlans,
    getSingleSubscriptionPlan,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
};
