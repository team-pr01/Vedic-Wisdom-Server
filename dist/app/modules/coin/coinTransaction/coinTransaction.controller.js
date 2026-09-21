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
exports.CoinTransactionControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const coinTransaction_service_1 = require("./coinTransaction.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const config_1 = __importDefault(require("../../../config"));
// Initiate payment
const initiatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { packageId } = req.body;
    const userId = req.user.userId;
    const result = yield coinTransaction_service_1.CoinTransactionServices.initiatePayment(userId, packageId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Payment initiated successfully",
        data: result,
    });
}));
// Payment success
// controllers/coinTransaction.controller.ts
const paymentSuccess = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tranId = req.query.tran_id;
    if (!tranId) {
        return res.redirect(`${config_1.default.frontend_url}/coin-transaction/fail?error=Missing transaction ID`);
    }
    try {
        yield coinTransaction_service_1.CoinTransactionServices.handlePaymentSuccess(tranId);
        // Redirect to frontend success page
        res.redirect(`${config_1.default.frontend_url}/coin-transaction/success?transactionId=${tranId}`);
    }
    catch (error) {
        // Redirect to frontend failure page
        res.redirect(`${config_1.default.frontend_url}/coin-transaction/fail?transactionId=${tranId}`);
    }
}));
// Payment failure
const paymentFail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id } = req.query;
    yield coinTransaction_service_1.CoinTransactionServices.handlePaymentFailure(tran_id);
    // Redirect to frontend failure page
    res.redirect(`${config_1.default.frontend_url}/coin-transaction/fail?transactionId=${tran_id}`);
}));
// Get all transactions (Admin)
const getAllTransactions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, userId, keyword, skip = "0", limit = "10" } = req.query;
    const filters = {
        status: status,
        userId: userId,
        keyword: keyword,
    };
    const result = yield coinTransaction_service_1.CoinTransactionServices.getAllTransactions(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Transactions fetched successfully",
        data: {
            transactions: result.data,
            meta: result.meta,
        },
    });
}));
// Get single transaction
const getSingleTransactionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId } = req.params;
    const result = yield coinTransaction_service_1.CoinTransactionServices.getSingleTransactionById(transactionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Transaction fetched successfully",
        data: result,
    });
}));
// Get user's transactions
const getUserTransactions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { skip = "0", limit = "10" } = req.query;
    const userId = req.user.userId;
    const result = yield coinTransaction_service_1.CoinTransactionServices.getUserTransactions(userId, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User transactions fetched successfully",
        data: {
            transactions: result.data,
            meta: result.meta,
        },
    });
}));
exports.CoinTransactionControllers = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    getAllTransactions,
    getSingleTransactionById,
    getUserTransactions,
};
