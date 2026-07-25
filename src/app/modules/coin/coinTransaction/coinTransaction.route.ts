import express from "express";
import { CoinTransactionControllers } from "./coinTransaction.controller";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";

const router = express.Router();

// Public payment routes (SSL Commerz callbacks)
router.all("/payment/success", CoinTransactionControllers.paymentSuccess);
router.all("/payment/fail", CoinTransactionControllers.paymentFail);

// Protected routes
router.post(
  "/initiate",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  CoinTransactionControllers.initiatePayment
);

router.get(
  "/my-transactions",
  auth(UserRole.user, UserRole.admin, UserRole.moderator),
  CoinTransactionControllers.getUserTransactions
);

// Admin only routes
router.get(
  "/all",
  auth(UserRole.admin, UserRole.moderator),
  CoinTransactionControllers.getAllTransactions
);

router.get(
  "/:transactionId",
  auth(UserRole.admin, UserRole.moderator),
  CoinTransactionControllers.getSingleTransactionById
);

export const CoinTransactionRoutes = router;