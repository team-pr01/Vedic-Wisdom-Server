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
exports.ProjectTransactionServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const axios_1 = __importDefault(require("axios"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const config_1 = __importDefault(require("../../../config"));
const infinitePaginate_1 = require("../../../utils/infinitePaginate");
const generateTransactionId_1 = require("../../../utils/generateTransactionId");
const auth_model_1 = require("../../auth/auth.model");
const project_model_1 = __importDefault(require("../project.model"));
const projectTransaction_model_1 = __importDefault(require("./projectTransaction.model"));
// Initialize SSL Commerz payment for a donation
const initiatePayment = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { projectId, name, phoneNumber, amount } = payload;
    if (!amount || amount <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Invalid donation amount");
    }
    // Get project details
    const project = yield project_model_1.default.findById(projectId);
    if (!project) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Project not found");
    }
    // Optional: guard against over-donation
    const remaining = project.amountNeeded - (project.amountRaised || 0);
    if (remaining > 0 && amount > remaining) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, `Donation exceeds remaining amount (${remaining})`);
    }
    // Resolve email for SSL Commerz (it requires a valid email)
    let userEmail = "";
    if (userId) {
        const user = yield auth_model_1.User.findById(userId);
        if (user === null || user === void 0 ? void 0 : user.email)
            userEmail = user.email;
    }
    if (!userEmail) {
        userEmail = `donor-${Date.now()}@example.com`;
    }
    const transactionId = (0, generateTransactionId_1.generateTransactionId)();
    // Create transaction record with pending status
    const transaction = yield projectTransaction_model_1.default.create({
        projectId,
        userId,
        donorName: name,
        phoneNumber,
        amount,
        currency: "BDT",
        transactionId,
        status: "pending",
    });
    // Prepare SSL Commerz data
    const storeId = config_1.default.store_id;
    const storePassword = config_1.default.store_passwd;
    const postData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: amount,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${config_1.default.backend_url}/api/v1/project-transaction/payment/success?tran_id=${transactionId}`,
        fail_url: `${config_1.default.backend_url}/api/v1/project-transaction/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${config_1.default.backend_url}/api/v1/project-transaction/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${config_1.default.backend_url}/api/v1/project-transaction/payment/ipn`,
        cus_name: name || "Donor",
        cus_email: userEmail,
        cus_phone: phoneNumber || "N/A",
        cus_add1: "N/A",
        cus_city: "N/A",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_name: `Donation for ${project.title}`,
        product_category: "Donation",
        product_profile: "non-physical-goods",
    };
    try {
        // Send request to SSL Commerz using axios.post
        const response = yield axios_1.default.post("https://sandbox.sslcommerz.com/gwprocess/v4/api.php", new URLSearchParams(postData).toString(), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        if (response.data && response.data.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: response.data.GatewayPageURL,
            };
        }
        transaction.status = "failed";
        yield transaction.save();
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, ((_a = response.data) === null || _a === void 0 ? void 0 : _a.failedreason) || "Payment initiation failed");
    }
    catch (error) {
        // Check if error contains success response
        if (((_c = (_b = error === null || error === void 0 ? void 0 : error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.status) === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: error.response.data.GatewayPageURL,
            };
        }
        // Avoid double-saving / masking AppError thrown above
        if (!(error instanceof AppError_1.default)) {
            transaction.status = "failed";
            yield transaction.save();
            throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, ((_e = (_d = error === null || error === void 0 ? void 0 : error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.failedreason) ||
                (error === null || error === void 0 ? void 0 : error.message) ||
                "Payment initiation failed");
        }
        throw error;
    }
});
// Handle donation payment success (idempotent + atomic)
const paymentSuccess = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find transaction — do NOT trust query params for amount/name
    const transaction = yield projectTransaction_model_1.default.findOne({
        transactionId: tranId,
    });
    if (!transaction) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    // Idempotency — if already paid, do nothing
    if (transaction.status === "paid") {
        return {
            success: true,
            message: "Transaction already processed",
            transaction,
        };
    }
    if (transaction.status !== "pending") {
        // failed / cancelled — do not credit
        return {
            success: false,
            message: `Transaction is ${transaction.status}`,
            transaction,
        };
    }
    // Atomic flip from pending -> paid.
    // If another request already flipped it, this returns null.
    const updatedTx = yield projectTransaction_model_1.default.findOneAndUpdate({ transactionId: tranId, status: "pending" }, { status: "paid" }, { new: true });
    if (!updatedTx) {
        // Someone else already processed it
        return { success: true, message: "Transaction already processed" };
    }
    // Atomically increment project's amountRaised and push donor
    yield project_model_1.default.findByIdAndUpdate(updatedTx.projectId, {
        $inc: { amountRaised: updatedTx.amount },
        $push: {
            donors: {
                name: updatedTx.donorName,
                phoneNumber: updatedTx.phoneNumber,
                amount: String(updatedTx.amount), // schema stores String
                donatedAt: new Date(),
            },
        },
    }, { new: true });
    return updatedTx;
});
// Handle donation payment failure
const paymentFail = (tranId) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield projectTransaction_model_1.default.findOne({
        transactionId: tranId,
    });
    if (!transaction) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    // Only flip pending -> failed
    const result = yield projectTransaction_model_1.default.findOneAndUpdate({ transactionId: tranId, status: "pending" }, { status: "failed" }, { new: true });
    return result;
});
// Get all donation transactions (Admin)
const getAllProjectTransactions = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (filters = {}, skip = 0, limit = 10) {
    const query = {};
    // Filter by status
    if (filters.status) {
        query.status = filters.status;
    }
    // Filter by user
    if (filters.userId) {
        query.userId = filters.userId;
    }
    // Filter by project
    if (filters.projectId) {
        query.projectId = filters.projectId;
    }
    // Search by transaction ID
    if (filters.keyword) {
        query.transactionId = { $regex: filters.keyword, $options: "i" };
    }
    return (0, infinitePaginate_1.infinitePaginate)(projectTransaction_model_1.default, query, skip, limit, [
        { path: "userId", select: "name email" },
        { path: "projectId", select: "title location amountNeeded amountRaised" },
    ]);
});
// Get single donation transaction by ID
const getSingleProjectTransactionById = (transactionId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield projectTransaction_model_1.default.findOne({ transactionId })
        .populate("userId", "name email")
        .populate("projectId", "title location amountNeeded amountRaised");
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Transaction not found");
    }
    return result;
});
// Get donations for a project
const getProjectDonations = (projectId_1, ...args_1) => __awaiter(void 0, [projectId_1, ...args_1], void 0, function* (projectId, skip = 0, limit = 10) {
    const query = { projectId, status: "paid" };
    return (0, infinitePaginate_1.infinitePaginate)(projectTransaction_model_1.default, query, skip, limit, [
        { path: "userId", select: "name email" },
    ]);
});
exports.ProjectTransactionServices = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    getAllProjectTransactions,
    getSingleProjectTransactionById,
    getProjectDonations,
};
