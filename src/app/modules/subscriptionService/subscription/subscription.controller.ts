import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { SubscriptionServices } from "./subscription.service";
import config from "../../../config";

const initiateSubscriptionPayment = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await SubscriptionServices.initiateSubscriptionPayment(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

// 2. Payment Success Callback
const subscriptionPaymentSuccess = catchAsync(async (req, res) => {
  const tranId = req.query.tran_id as string;

  if (!tranId) {
    return res.redirect(`${config.frontend_url}/payment/fail?transactionId=${tranId}`);
  }

  try {
    await SubscriptionServices.handleSubscriptionPaymentSuccess(tranId);
    res.redirect(`${config.frontend_url}/payment/success?transactionId=${tranId}`);
  } catch (error) {
    res.redirect(`${config.frontend_url}/payment/fail?transactionId=${tranId}`);
  }
});

// 3. Payment Fail Callback
const paymentFail = catchAsync(async (req, res) => {
  const tranId = req.query.tran_id as string;
  if (tranId) {
    await SubscriptionServices.handleSubscriptionPaymentFailure(tranId);
  }
  res.redirect(`${config.frontend_url}/payment/fail?transactionId=${tranId}`);
});

// Get all subscriptions (admin)
const getAllSubscriptions = catchAsync(async (req, res) => {
  const { keyword, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
  };

  const result = await SubscriptionServices.getAllSubscriptions(
    filters,
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
const getMySubscriptions = catchAsync(async (req, res) => {
  const { skip = "0", limit = "10" } = req.query;

  const result = await SubscriptionServices.getMySubscriptions(
    req.user.userId,
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
    req.user.userId,
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
  const result = await SubscriptionServices.cancelSubscription(id, req.user.userId);

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
  const result = await SubscriptionServices.renewSubscription(id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Subscription renewed successfully",
    data: result,
  });
});

export const SubscriptionController = {
  initiateSubscriptionPayment,
  subscriptionPaymentSuccess,
  paymentFail,
  getAllSubscriptions,
  getMySubscriptions,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  cancelSubscription,
  renewSubscription,
};