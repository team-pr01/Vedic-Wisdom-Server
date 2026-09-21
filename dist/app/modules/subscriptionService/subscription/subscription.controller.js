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
exports.SubscriptionController = void 0;
// controllers/subscription.controller.ts
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const subscription_service_1 = require("./subscription.service");
// Create subscription
const createSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield subscription_service_1.SubscriptionServices.createSubscription(req.body, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Subscription created successfully",
        data: result,
    });
}));
// Get all subscriptions (admin)
const getAllSubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { keyword, skip = "0", limit = "10" } = req.query;
    const filters = {
        keyword: keyword,
    };
    const result = yield subscription_service_1.SubscriptionServices.getAllSubscriptions(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All subscriptions fetched successfully",
        data: {
            subscriptions: result.data,
            meta: result.meta,
        },
    });
}));
// Get user's subscriptions
const getMySubscriptions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const result = yield subscription_service_1.SubscriptionServices.getMySubscriptions(req.user.userId, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User subscriptions fetched successfully",
        data: {
            subscriptions: result.data,
            meta: result.meta,
        },
    });
}));
// Get single subscription
const getSingleSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscription_service_1.SubscriptionServices.getSingleSubscription(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription fetched successfully",
        data: result,
    });
}));
// Update subscription
const updateSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscription_service_1.SubscriptionServices.updateSubscription(id, req.body, req.user.userId, req.user.role);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription updated successfully",
        data: result,
    });
}));
// Delete subscription
const deleteSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscription_service_1.SubscriptionServices.deleteSubscription(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription deleted successfully",
        data: result,
    });
}));
// Cancel subscription
const cancelSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscription_service_1.SubscriptionServices.cancelSubscription(id, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription cancelled successfully",
        data: result,
    });
}));
// Renew subscription
const renewSubscription = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield subscription_service_1.SubscriptionServices.renewSubscription(id, req.user.userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Subscription renewed successfully",
        data: result,
    });
}));
exports.SubscriptionController = {
    createSubscription,
    getAllSubscriptions,
    getMySubscriptions,
    getSingleSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    renewSubscription,
};
