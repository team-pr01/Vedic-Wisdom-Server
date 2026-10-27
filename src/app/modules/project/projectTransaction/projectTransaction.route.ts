import express from "express";
import auth from "../../../middlewares/auth";
import { UserRole } from "../../auth/auth.constants";
import { ProjectTransactionControllers } from "./projectTransaction.controller";

const router = express.Router();

router.all("/payment/success", ProjectTransactionControllers.paymentSuccess);
router.all("/payment/fail", ProjectTransactionControllers.paymentFail);

router.post(
    "/initiate",
    auth(UserRole.user, UserRole.admin, UserRole.moderator),
    ProjectTransactionControllers.initiatePayment
);

// Admin only routes
router.get(
    "/all",
    auth(UserRole.admin, UserRole.moderator),
    ProjectTransactionControllers.getAllProjectTransactions
);

router.get(
    "/project/:id",
    ProjectTransactionControllers.getProjectDonations
);

router.get(
    "/:transactionId",
    auth(UserRole.admin, UserRole.moderator),
    ProjectTransactionControllers.getSingleProjectTransactionById
);

export const ProjectTransactionRoutes = router;