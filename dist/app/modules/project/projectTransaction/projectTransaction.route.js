"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectTransactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const auth_constants_1 = require("../../auth/auth.constants");
const projectTransaction_controller_1 = require("./projectTransaction.controller");
const router = express_1.default.Router();
router.all("/payment/success", projectTransaction_controller_1.ProjectTransactionControllers.paymentSuccess);
router.all("/payment/fail", projectTransaction_controller_1.ProjectTransactionControllers.paymentFail);
router.post("/initiate", (0, auth_1.default)(auth_constants_1.UserRole.user, auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), projectTransaction_controller_1.ProjectTransactionControllers.initiatePayment);
// Admin only routes
router.get("/all", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), projectTransaction_controller_1.ProjectTransactionControllers.getAllProjectTransactions);
router.get("/project/:id", projectTransaction_controller_1.ProjectTransactionControllers.getProjectDonations);
router.get("/:transactionId", (0, auth_1.default)(auth_constants_1.UserRole.admin, auth_constants_1.UserRole.moderator), projectTransaction_controller_1.ProjectTransactionControllers.getSingleProjectTransactionById);
exports.ProjectTransactionRoutes = router;
