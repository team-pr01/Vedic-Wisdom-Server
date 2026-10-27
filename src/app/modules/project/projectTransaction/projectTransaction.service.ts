/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import axios from "axios";
import AppError from "../../../errors/AppError";
import config from "../../../config";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { generateTransactionId } from "../../../utils/generateTransactionId";
import { User } from "../../auth/auth.model";
import Project from "../project.model";
import ProjectTransaction from "./projectTransaction.model";

// Initialize SSL Commerz payment for a donation
const initiatePayment = async (
    userId: string | undefined,
    payload: {
        projectId: string;
        name: string;
        phoneNumber: string;
        amount: number;
    }
) => {
    const { projectId, name, phoneNumber, amount } = payload;

    if (!amount || amount <= 0) {
        throw new AppError(httpStatus.BAD_REQUEST, "Invalid donation amount");
    }

    // Get project details
    const project = await Project.findById(projectId);
    if (!project) {
        throw new AppError(httpStatus.NOT_FOUND, "Project not found");
    }

    // Optional: guard against over-donation
    const remaining = project.amountNeeded - (project.amountRaised || 0);
    if (remaining > 0 && amount > remaining) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `Donation exceeds remaining amount (${remaining})`
        );
    }

    // Resolve email for SSL Commerz (it requires a valid email)
    let userEmail = "";
    if (userId) {
        const user = await User.findById(userId);
        if (user?.email) userEmail = user.email;
    }
    if (!userEmail) {
        userEmail = `donor-${Date.now()}@example.com`;
    }

    const transactionId = generateTransactionId();

    // Create transaction record with pending status
    const transaction = await ProjectTransaction.create({
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
    const storeId = config.store_id;
    const storePassword = config.store_passwd;

    const postData = {
        store_id: storeId,
        store_passwd: storePassword,
        total_amount: amount,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${config.backend_url}/api/v1/project-transaction/payment/success?tran_id=${transactionId}`,
        fail_url: `${config.backend_url}/api/v1/project-transaction/payment/fail?tran_id=${transactionId}`,
        cancel_url: `${config.backend_url}/api/v1/project-transaction/payment/cancel?tran_id=${transactionId}`,
        ipn_url: `${config.backend_url}/api/v1/project-transaction/payment/ipn`,
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
        const response = await axios.post(
            "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
            new URLSearchParams(postData as any).toString(),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        if (response.data && response.data.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: response.data.GatewayPageURL,
            };
        }

        transaction.status = "failed";
        await transaction.save();

        throw new AppError(
            httpStatus.BAD_REQUEST,
            response.data?.failedreason || "Payment initiation failed"
        );
    } catch (error: any) {
        // Check if error contains success response
        if (error?.response?.data?.status === "SUCCESS") {
            return {
                transactionId,
                paymentUrl: error.response.data.GatewayPageURL,
            };
        }

        // Avoid double-saving / masking AppError thrown above
        if (!(error instanceof AppError)) {
            transaction.status = "failed";
            await transaction.save();

            throw new AppError(
                httpStatus.INTERNAL_SERVER_ERROR,
                error?.response?.data?.failedreason ||
                error?.message ||
                "Payment initiation failed"
            );
        }

        throw error;
    }
};

// Handle donation payment success (idempotent + atomic)
const paymentSuccess = async (tranId: string) => {
    // Find transaction — do NOT trust query params for amount/name
    const transaction = await ProjectTransaction.findOne({
        transactionId: tranId,
    });

    if (!transaction) {
        throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
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
    const updatedTx = await ProjectTransaction.findOneAndUpdate(
        { transactionId: tranId, status: "pending" },
        { status: "paid" },
        { new: true }
    );

    if (!updatedTx) {
        // Someone else already processed it
        return { success: true, message: "Transaction already processed" };
    }

    // Atomically increment project's amountRaised and push donor
    await Project.findByIdAndUpdate(
        updatedTx.projectId,
        {
            $inc: { amountRaised: updatedTx.amount },
            $push: {
                donors: {
                    name: updatedTx.donorName,
                    phoneNumber: updatedTx.phoneNumber,
                    amount: String(updatedTx.amount), // schema stores String
                    donatedAt: new Date(),
                },
            },
        },
        { new: true }
    );

    return updatedTx;
};

// Handle donation payment failure
const paymentFail = async (tranId: string) => {
    const transaction = await ProjectTransaction.findOne({
        transactionId: tranId,
    });

    if (!transaction) {
        throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    // Only flip pending -> failed
    const result = await ProjectTransaction.findOneAndUpdate(
        { transactionId: tranId, status: "pending" },
        { status: "failed" },
        { new: true }
    );

    return result;
};

// Get all donation transactions (Admin)
const getAllProjectTransactions = async (filters: any = {}, skip = 0, limit = 10) => {
    const query: any = {};

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

    return infinitePaginate(ProjectTransaction, query, skip, limit, [
        { path: "userId", select: "name email" },
        { path: "projectId", select: "title location amountNeeded amountRaised" },
    ]);
};

// Get single donation transaction by ID
const getSingleProjectTransactionById = async (transactionId: string) => {
    const result = await ProjectTransaction.findOne({ transactionId })
        .populate("userId", "name email")
        .populate("projectId", "title location amountNeeded amountRaised");

    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
    }

    return result;
};

// Get donations for a project
const getProjectDonations = async (
    projectId: string,
    skip = 0,
    limit = 10
) => {
    const query: any = { projectId, status: "paid" };
    return infinitePaginate(ProjectTransaction, query, skip, limit, [
        { path: "userId", select: "name email" },
    ]);
};

export const ProjectTransactionServices = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    getAllProjectTransactions,
    getSingleProjectTransactionById,
    getProjectDonations,
};