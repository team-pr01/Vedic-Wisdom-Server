import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import config from "../../../config";
import { ProjectTransactionServices } from "./projectTransaction.service";

// Initiate donation payment
const initiatePayment = catchAsync(async (req, res) => {
    const { projectId, name, phoneNumber, amount } = req.body;
    const userId = req.user?.userId; // optional — allows guests if route is public

    const result = await ProjectTransactionServices.initiatePayment(userId, {
        projectId,
        name,
        phoneNumber,
        amount: Number(amount),
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Donation payment initiated successfully",
        data: result,
    });
});

// Donation payment success (SSL Commerz redirect)
const paymentSuccess = catchAsync(async (req, res) => {
    const tranId = req.query.tran_id as string;

    if (!tranId) {
        return res.redirect(
            `${config.frontend_url}/payment/fail?error=Missing transaction ID`
        );
    }

    try {
        await ProjectTransactionServices.paymentSuccess(tranId);
        // Redirect to frontend success page
        res.redirect(
            `${config.frontend_url}/payment/success?transactionId=${tranId}`
        );
    } catch (error) {
        // Redirect to frontend failure page
        res.redirect(
            `${config.frontend_url}/payment/fail?transactionId=${tranId}`
        );
    }
});

// Donation payment failure
const paymentFail = catchAsync(async (req, res) => {
    const { tran_id } = req.query;
    await ProjectTransactionServices.paymentFail(tran_id as string);

    // Redirect to frontend failure page
    res.redirect(`${config.frontend_url}/payment/fail?transactionId=${tran_id}`);
});

// Donation payment cancel
const donationCancel = catchAsync(async (req, res) => {
    const { tran_id } = req.query;
    await ProjectTransactionServices.paymentFail(tran_id as string);

    // Redirect to frontend cancel page
    res.redirect(
        `${config.frontend_url}/payment/cancel?transactionId=${tran_id}`
    );
});

// IPN (server-to-server notification from SSL Commerz)
const paymentIpn = catchAsync(async (req, res) => {
    const { tran_id, status } = req.body || req.query;

    if (tran_id) {
        if (status === "VALID" || status === "VALIDATED") {
            await ProjectTransactionServices.paymentSuccess(
                tran_id as string
            );
        } else if (status === "FAILED") {
            await ProjectTransactionServices.paymentFail(
                tran_id as string
            );
        }
    }

    // SSL Commerz expects a 200 response
    res.status(200).send("OK");
});

// Get all donation transactions (Admin)
const getAllProjectTransactions = catchAsync(async (req, res) => {
    const {
        status,
        userId,
        projectId,
        keyword,
        skip = "0",
        limit = "10",
    } = req.query;

    const filters = {
        status: status as string,
        userId: userId as string,
        projectId: projectId as string,
        keyword: keyword as string,
    };

    const result = await ProjectTransactionServices.getAllProjectTransactions(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Donations fetched successfully",
        data: {
            donations: result.data,
            meta: result.meta,
        },
    });
});

// Get single donation transaction
const getSingleProjectTransactionById = catchAsync(async (req, res) => {
    const { transactionId } = req.params;
    const result = await ProjectTransactionServices.getSingleProjectTransactionById(
        transactionId
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Donation fetched successfully",
        data: result,
    });
});

// Get donations for a project
const getProjectDonations = catchAsync(async (req, res) => {
    const { projectId } = req.params;
    const { skip = "0", limit = "10" } = req.query;

    const result = await ProjectTransactionServices.getProjectDonations(
        projectId,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Project donations fetched successfully",
        data: {
            donations: result.data,
            meta: result.meta,
        },
    });
});

export const ProjectTransactionControllers = {
    initiatePayment,
    paymentSuccess,
    paymentFail,
    paymentIpn,
    getAllProjectTransactions,
    getSingleProjectTransactionById,
    donationCancel,
    getProjectDonations,
};