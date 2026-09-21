/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import axios from "axios";
import { CoinPackage } from "../coinPackage/coinPackage.model";
import AppError from "../../../errors/AppError";
import { User } from "../../auth/auth.model";
import config from "../../../config";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { generateTransactionId } from "../../../utils/generateTransactionId";
import { CoinTransaction } from "./coinTransaction.model";


// Initialize SSL Commerz payment
const initiatePayment = async (userId: string, packageId: string) => {
  // Get package details
  const packageData = await CoinPackage.findById(packageId);
  if (!packageData) {
    throw new AppError(httpStatus.NOT_FOUND, "Coin package not found");
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const transactionId = generateTransactionId();

  const payload = {
    userId,
    packageId,
    coinAmount: packageData.amount,
    price: packageData.discountedPrice,
    transactionId: transactionId,
    status: "pending",
  };

  // Create transaction record with pending status
  const transaction = await CoinTransaction.create(payload);

  // Prepare SSL Commerz data
  const storeId = config.store_id;
  const storePassword = config.store_passwd;

  const postData = {
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: packageData.discountedPrice,
    currency: "BDT",
    tran_id: transactionId,
    success_url: `${config.backend_url}/api/v1/coin-transaction/payment/success?tran_id=${transactionId}`,
    fail_url: `${config.backend_url}/api/v1/coin-transaction/payment/fail?tran_id=${transactionId}`,
    cancel_url: `${config.backend_url}/api/v1/coin-transaction/payment/cancel?tran_id=${transactionId}`,
    ipn_url: `${config.backend_url}/api/v1/coin-transaction/payment/ipn`,
    cus_name: user.name || "Customer",
    cus_email: user.email,
    cus_phone: user.phoneNumber || "",
    cus_add1: "N/A",
    cus_city: "N/A",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: `${packageData.amount} Arya Coins`,
    product_category: "Virtual Goods",
    product_profile: "non-physical-goods",
  };

  try {
    // Send request to SSL Commerz using axios.post
    const response = await axios.post(
      "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
      new URLSearchParams(postData as any).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // ✅ Check response
    if (response.data && response.data.status === "SUCCESS") {
      return {
        transactionId: transactionId,
        paymentUrl: response.data.GatewayPageURL,
      };
    } else {
      transaction.status = "failed";
      await transaction.save();
      throw new AppError(
        httpStatus.BAD_REQUEST,
        response.data?.failedreason || "Payment initiation failed"
      );
    }
  } catch (error: any) {
    // ✅ Check if error contains success response
    if (error.response?.data?.status === "SUCCESS") {
      return {
        transactionId: transactionId,
        paymentUrl: error.response.data.GatewayPageURL,
      };
    }

    transaction.status = "failed";
    await transaction.save();
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      error?.response?.data?.failedreason || error?.message || "Payment initiation failed"
    );
  }
};

// Handle payment success
const handlePaymentSuccess = async (tranId: string) => {
  // First find transaction by tranId
  const transaction = await CoinTransaction.findOne({ transactionId: tranId });

  if (!transaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  // Only process if status is pending
  if (transaction.status !== "pending") {
    return { success: true, message: "Transaction already processed", transaction };
  }

  const result = await CoinTransaction.findOneAndUpdate(
    { transactionId: tranId },
    { status: "paid" },
    { new: true }
  );

  await User.findOneAndUpdate(
    { _id: transaction.userId },
    { $inc: { coins: transaction?.coinAmount } },
    { new: true }
  )
  return result;
};

// Handle payment failure
const handlePaymentFailure = async (tranId: string) => {
  const transaction = await CoinTransaction.findOne({ transactionId: tranId });
  if (!transaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  let result

  if (transaction.status === "pending") {
    result = await CoinTransaction.findOneAndUpdate(
      { transactionId: tranId },
      { status: "failed" },
      { new: true }
    )
  }

  return result;
};

// Get all transactions (Admin)
const getAllTransactions = async (filters: any = {}, skip = 0, limit = 10) => {
  const query: any = {};

  // Filter by status
  if (filters.status) {
    query.status = filters.status;
  }

  // Filter by user
  if (filters.userId) {
    query.userId = filters.userId;
  }

  // Search by transaction ID
  if (filters.keyword) {
    query.transactionId = { $regex: filters.keyword, $options: "i" };
  }

  return infinitePaginate(CoinTransaction, query, skip, limit, [
    { path: "userId", select: "name email" },
    { path: "packageId", select: "amount discountedPrice" },
  ]);
};

// Get single transaction by ID
const getSingleTransactionById = async (transactionId: string) => {
  const result = await CoinTransaction.findOne({ transactionId })
    .populate("userId", "name email")
    .populate("packageId", "amount discountedPrice");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
  }

  return result;
};

// Get user's transactions
const getUserTransactions = async (userId: string, skip = 0, limit = 10) => {
  const query: any = { userId };
  return infinitePaginate(CoinTransaction, query, skip, limit, [
    { path: "packageId", select: "amount discountedPrice" },
  ]);
};

export const CoinTransactionServices = {
  initiatePayment,
  handlePaymentSuccess,
  handlePaymentFailure,
  getAllTransactions,
  getSingleTransactionById,
  getUserTransactions,
};