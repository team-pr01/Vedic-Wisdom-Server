import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import { CoinTransactionServices } from "./coinTransaction.service";
import sendResponse from "../../../utils/sendResponse";
import config from "../../../config";

// Initiate payment
const initiatePayment = catchAsync(async (req, res) => {
  const { packageId } = req.body;
  const userId = req.user.userId;

  const result = await CoinTransactionServices.initiatePayment(
    userId,
    packageId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiated successfully",
    data: result,
  });
});

// Payment success
// controllers/coinTransaction.controller.ts
const paymentSuccess = catchAsync(async (req, res) => {
  const tranId = req.query.tran_id as string;

  if (!tranId) {
    return res.redirect(`${config.frontend_url}/coin-transaction/fail?error=Missing transaction ID`);
  }

  try {
    await CoinTransactionServices.handlePaymentSuccess(tranId);
    // Redirect to frontend success page
    res.redirect(`${config.frontend_url}/coin-transaction/success?transactionId=${tranId}`);
  } catch (error) {
    // Redirect to frontend failure page
    res.redirect(`${config.frontend_url}/coin-transaction/fail?transactionId=${tranId}`);
  }
});

// Payment failure
const paymentFail = catchAsync(async (req, res) => {
  const { tran_id } = req.query;
  await CoinTransactionServices.handlePaymentFailure(tran_id as string);

  // Redirect to frontend failure page
  res.redirect(`${config.frontend_url}/coin-transaction/fail?transactionId=${tran_id}`);
});

// Get all transactions (Admin)
const getAllTransactions = catchAsync(async (req, res) => {
  const { status, userId, keyword, skip = "0", limit = "10" } = req.query;

  const filters = {
    status: status as string,
    userId: userId as string,
    keyword: keyword as string,
  };

  const result = await CoinTransactionServices.getAllTransactions(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transactions fetched successfully",
    data: {
      transactions: result.data,
      meta: result.meta,
    },
  });
});

// Get single transaction
const getSingleTransactionById = catchAsync(async (req, res) => {
  const { transactionId } = req.params;
  const result = await CoinTransactionServices.getSingleTransactionById(
    transactionId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Transaction fetched successfully",
    data: result,
  });
});

// Get user's transactions
const getUserTransactions = catchAsync(async (req, res) => {
  const { skip = "0", limit = "10" } = req.query;
  const userId = req.user.userId;

  const result = await CoinTransactionServices.getUserTransactions(
    userId,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User transactions fetched successfully",
    data: {
      transactions: result.data,
      meta: result.meta,
    },
  });
});

export const CoinTransactionControllers = {
  initiatePayment,
  paymentSuccess,
  paymentFail,
  getAllTransactions,
  getSingleTransactionById,
  getUserTransactions,
};