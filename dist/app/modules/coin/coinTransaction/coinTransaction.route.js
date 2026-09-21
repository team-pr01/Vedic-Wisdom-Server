"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinTransactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const coinTransaction_controller_1 = require("./coinTransaction.controller");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const router = express_1.default.Router();
// Public payment routes (SSL Commerz callbacks)
router.all("/payment/success", coinTransaction_controller_1.CoinTransactionControllers.paymentSuccess);
router.all("/payment/fail", coinTransaction_controller_1.CoinTransactionControllers.paymentFail);
// Protected routes
router.post("/initiate", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinTransaction_controller_1.CoinTransactionControllers.initiatePayment);
router.get("/my-transactions", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinTransaction_controller_1.CoinTransactionControllers.getUserTransactions);
// Admin only routes
router.get("/all", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinTransaction_controller_1.CoinTransactionControllers.getAllTransactions);
router.get("/:transactionId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), coinTransaction_controller_1.CoinTransactionControllers.getSingleTransactionById);
exports.CoinTransactionRoutes = router;
