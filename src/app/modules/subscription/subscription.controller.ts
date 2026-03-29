// controllers/subscription.controller.ts
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { SubscriptionServices } from "./subscription.service";

// Create subscription
const createSubscription = catchAsync(async (req, res) => {
  const result = await SubscriptionServices.createSubscription(
    req.body,
    req.user._id
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Subscription created successfully",
    data: result,
  });
});

// Get all subscriptions (admin)
const getAllSubscriptions = catchAsync(async (req, res) => {
  const { keyword, status, plan, skip = "0", limit = "10" } = req.query;

  const result = await SubscriptionServices.getAllSubscriptions(
    keyword as string,
    status as string,
    plan as string,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All subscriptions fetched successfully",
    data: {
      subscriptions: result.data,
      meta: result.meta,
    },
  });
});

// Get user's subscriptions
const getUserSubscriptions = catchAsync(async (req, res) => {
  const { skip = "0", limit = "10" } = req.query;

  const result = await SubscriptionServices.getUserSubscriptions(
    req.user._id,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User subscriptions fetched successfully",
    data: {
      subscriptions: result.data,
      meta: result.meta,
    },
  });
});

// Get single subscription
const getSingleSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionServices.getSingleSubscription(
    id,
    req.user._id,
    req.user.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription fetched successfully",
    data: result,
  });
});

// Update subscription
const updateSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionServices.updateSubscription(
    id,
    req.body,
    req.user._id,
    req.user.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription updated successfully",
    data: result,
  });
});

// Delete subscription
const deleteSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionServices.deleteSubscription(
    id,
    req.user._id,
    req.user.role
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription deleted successfully",
    data: result,
  });
});

// Cancel subscription
const cancelSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionServices.cancelSubscription(id, req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription cancelled successfully",
    data: result,
  });
});

// Renew subscription
const renewSubscription = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await SubscriptionServices.renewSubscription(id, req.user._id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription renewed successfully",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscriptions,
  getUserSubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  renewSubscription,
};