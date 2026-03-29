// controllers/subscriptionPlan.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { SubscriptionPlanServices } from "./subscriptionPlan.service";
import sendResponse from "../../utils/sendResponse";

// Create subscription plan
const createSubscriptionPlan = catchAsync(async (req, res) => {
  const result = await SubscriptionPlanServices.createSubscriptionPlan(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription plan created successfully",
    data: result,
  });
});

// Get all subscription plans (admin)
const getAllSubscriptionPlans = catchAsync(async (req, res) => {
  const { keyword, status, billingType, skip = "0", limit = "10" } = req.query;

  const result = await SubscriptionPlanServices.getAllSubscriptionPlans(
    keyword as string,
    status as string,
    billingType as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All subscription plans fetched successfully",
    data: {
      plans: result.data,
      meta: result.meta,
    },
  });
});

// Get active subscription plans (for users)
const getActiveSubscriptionPlans = catchAsync(async (req, res) => {
  const { keyword, billingType, skip = "0", limit = "10" } = req.query;

  const result = await SubscriptionPlanServices.getActiveSubscriptionPlans(
    keyword as string,
    billingType as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Active subscription plans fetched successfully",
    data: {
      plans: result.data,
      meta: result.meta,
    },
  });
});

// Get single subscription plan
const getSingleSubscriptionPlan = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionPlanServices.getSingleSubscriptionPlan(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription plan fetched successfully",
    data: result,
  });
});

// Update subscription plan
const updateSubscriptionPlan = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionPlanServices.updateSubscriptionPlan(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription plan updated successfully",
    data: result,
  });
});

// Delete subscription plan
const deleteSubscriptionPlan = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionPlanServices.deleteSubscriptionPlan(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription plan deleted successfully",
    data: result,
  });
});

export const SubscriptionPlanController = {
  createSubscriptionPlan,
  getAllSubscriptionPlans,
  getActiveSubscriptionPlans,
  getSingleSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
};