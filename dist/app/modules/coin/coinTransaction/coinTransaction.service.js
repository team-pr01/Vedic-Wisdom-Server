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
exports.CoinTransactionServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const axios_1 = __importDefault(require("axios"));
const coinPackage_model_1 = require("../coinPackage/coinPackage.model");
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const auth_model_1 = require("../../auth/auth.model");
const config_1 = __importDefault(require("../../../config"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const generateTransactionId_1 = require("../../../utils/generateTransactionId");
const coinTransaction_model_1 = require("./coinTransaction.model");
// Initialize SSL Commerz payment
const initiatePayment = (userId, packageId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    // Get package details
    const packageData = yield coinPackage_model_1.CoinPackage.findById(packageId);
    if (!packageData) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Coin package not found");
    }
    // Get user details
    const user = yield auth_model_1.User.findById(userId);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const transactionId = (0, generateTransactionId_1.generateTransactionId)();
    const payload = {
        userId,
        packageId,
        coinAmount: packageData.amount,
        price: packageData.discountedPrice,
        transactionId: transactionId,
        status: "pending",
    };
    // Create transaction record with pending status
    const transaction = yield coinTransaction_model_1.CoinTransaction.create(payload);
    // Prepare SSL Commerz data
    const storeId = config_1.default.store_id;
    const storePassword = config_1.default.store_passwd;
    const postData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: packageData.discountedPrice,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${config_1.default.backend_url}/api/v1/coin-transaction/payment/success?tran_id=${transactionId}`,
        fail_url: `${config_1.default.backend_url}/api/v1/coin-transaction/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${config_1.default.backend_url}/api/v1/coin-transaction/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${config_1.default.backend_url}/api/v1/coin-transaction/payment/ipn`,
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
        const response = yield axios_1.default.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", new URLSearchParams(postData).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        // ✅ Check response
        if (response.data && response.data.status === "SUCCESS") {
            return {
                transactionId: transactionId,
                paymentUrl: response.data.GatewayPageURL,
            };
        }
        else {
            transaction.status = "failed";
            yield transaction.save();
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.failedreason) || "Payment initiation failed");
        }
    }
    catch (error) {
        // ✅ Check if error contains success response
        if (((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.status) === "SUCCESS") {
            return {
                transactionId: transactionId,
                paymentUrl: error.response.data.GatewayPageURL,
            };
        }
        transaction.status = "failed";
        yield transaction.save();
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, ((_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.failedreason) || (error === null || error === void 0 ? void 0 : error.message) || "Payment initiation failed");
    }
});
// Handle payment success
const handlePaymentSuccess = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    // First find transaction by tranId
    const transaction = yield coinTransaction_model_1.CoinTransaction.findOne({ transactionId: tranId });
    if (!transaction) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    // Only process if status is pending
    if (transaction.status !== "pending") {
        return { success: true, message: "Transaction already processed", transaction };
    }
    const result = yield coinTransaction_model_1.CoinTransaction.findOneAndUpdate({ transactionId: tranId }, { status: "paid" }, { new: true });
    yield auth_model_1.User.findOneAndUpdate({ _id: transaction.userId }, { $inc: { coins: transaction === null || transaction === void 0 ? void 0 : transaction.coinAmount } }, { new: true });
    return result;
});
// Handle payment failure
const handlePaymentFailure = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield coinTransaction_model_1.CoinTransaction.findOne({ transactionId: tranId });
    if (!transaction) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    let result;
    if (transaction.status === "pending") {
        result = yield coinTransaction_model_1.CoinTransaction.findOneAndUpdate({ transactionId: tranId }, { status: "failed" }, { new: true });
    }
    return result;
});
// Get all transactions (Admin)
const getAllTransactions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
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
    return (0, infinitePaginate_1.infinitePaginate)(coinTransaction_model_1.CoinTransaction, query, skip, limit, [
        { path: "userId", select: "name email" },
        { path: "packageId", select: "amount discountedPrice" },
    ]);
});
// Get single transaction by ID
const getSingleTransactionById = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield coinTransaction_model_1.CoinTransaction.findOne({ transactionId })
        .populate("userId", "name email")
        .populate("packageId", "amount discountedPrice");
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    return result;
});
// Get user's transactions
const getUserTransactions = (userId_1, ...args_1) => __awaiter(void 0, [userId_1, ...args_1], void 0, function* (userId, skip = 0, limit = 10) {
    const query = { userId };
    return (0, infinitePaginate_1.infinitePaginate)(coinTransaction_model_1.CoinTransaction, query, skip, limit, [
        { path: "packageId", select: "amount discountedPrice" },
    ]);
});
exports.CoinTransactionServices = {
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentFailure,
    getAllTransactions,
    getSingleTransactionById,
    getUserTransactions,
};
