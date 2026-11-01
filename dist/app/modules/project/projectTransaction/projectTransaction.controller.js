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
exports.ProjectTransactionControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const config_1 = __importDefault(require("../../../config"));
const projectTransaction_service_1 = require("./projectTransaction.service");
// Initiate donation payment
const initiatePayment = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { projectId, name, phoneNumber, amount } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId; // optional — allows guests if route is public
    const result = yield projectTransaction_service_1.ProjectTransactionServices.initiatePayment(userId, {
        projectId,
        name,
        phoneNumber,
        amount: Number(amount),
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation payment initiated successfully",
        data: result,
    });
}));
// Donation payment success (SSL Commerz redirect)
const paymentSuccess = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tranId = req.query.tran_id;
    if (!tranId) {
        return res.redirect(`${config_1.default.frontend_url}/payment/fail?error=Missing transaction ID`);
    }
    try {
        yield projectTransaction_service_1.ProjectTransactionServices.paymentSuccess(tranId);
        // Redirect to frontend success page
        res.redirect(`${config_1.default.frontend_url}/payment/success?transactionId=${tranId}`);
    }
    catch (error) {
        // Redirect to frontend failure page
        res.redirect(`${config_1.default.frontend_url}/payment/fail?transactionId=${tranId}`);
    }
}));
// Donation payment failure
const paymentFail = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id } = req.query;
    yield projectTransaction_service_1.ProjectTransactionServices.paymentFail(tran_id);
    // Redirect to frontend failure page
    res.redirect(`${config_1.default.frontend_url}/payment/fail?transactionId=${tran_id}`);
}));
// Donation payment cancel
const donationCancel = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id } = req.query;
    yield projectTransaction_service_1.ProjectTransactionServices.paymentFail(tran_id);
    // Redirect to frontend cancel page
    res.redirect(`${config_1.default.frontend_url}/payment/cancel?transactionId=${tran_id}`);
}));
// IPN (server-to-server notification from SSL Commerz)
const paymentIpn = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tran_id, status } = req.body || req.query;
    if (tran_id) {
        if (status === "VALID" || status === "VALIDATED") {
            yield projectTransaction_service_1.ProjectTransactionServices.paymentSuccess(tran_id);
        }
        else if (status === "FAILED") {
            yield projectTransaction_service_1.ProjectTransactionServices.paymentFail(tran_id);
        }
    }
    // SSL Commerz expects a 200 response
    res.status(200).send("OK");
}));
// Get all donation transactions (Admin)
const getAllProjectTransactions = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { status, userId, projectId, keyword, skip = "0", limit = "10", } = req.query;
    const filters = {
        status: status,
        userId: userId,
        projectId: projectId,
        keyword: keyword,
    };
    const result = yield projectTransaction_service_1.ProjectTransactionServices.getAllProjectTransactions(filters, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donations fetched successfully",
        data: {
            donations: result.data,
            meta: result.meta,
        },
    });
}));
// Get single donation transaction
const getSingleProjectTransactionById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { transactionId } = req.params;
    const result = yield projectTransaction_service_1.ProjectTransactionServices.getSingleProjectTransactionById(transactionId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Donation fetched successfully",
        data: result,
    });
}));
// Get donations for a project
const getProjectDonations = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.params;
    const { skip = "0", limit = "10" } = req.query;
    const result = yield projectTransaction_service_1.ProjectTransactionServices.getProjectDonations(projectId, Number(skip), Number(limit));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Project donations fetched successfully",
        data: {
            donations: result.data,
            meta: result.meta,
        },
    });
}));
exports.ProjectTransactionControllers = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentIpn,
    getAllProjectTransactions,
    getSingleProjectTransactionById,
    donationCancel,
    getProjectDonations,
};
