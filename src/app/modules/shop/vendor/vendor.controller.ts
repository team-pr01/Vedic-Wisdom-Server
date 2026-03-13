import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { VendorServices } from "./vendor.service";

const applyVendor = catchAsync(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];

    const result = await VendorServices.applyVendor(
        req.user,
        req.body,
        files
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor applied successfully",
        data: result,
    });
});

/* Pending Applications */
const getPendingVendorApplications = catchAsync(async (req, res) => {

    const { skip = "0", limit = "10" } = req.query;

    const result = await VendorServices.getPendingVendorApplications(
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Pending vendor applications fetched",
        data: result,
    });
});

/* All Vendors */
const getAllVendors = catchAsync(async (req, res) => {

    const { keyword, status, skip = "0", limit = "10" } = req.query;

    const filters = {
        keyword: keyword as string,
        status: status as string,
    };

    const result = await VendorServices.getAllVendors(
        filters,
        Number(skip),
        Number(limit)
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendors fetched successfully",
        data: result,
    });
});

/* Single Vendor */
const getSingleVendorById = catchAsync(async (req, res) => {

    const { vendorId } = req.params;

    const result = await VendorServices.getSingleVendorById(
        vendorId
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor fetched successfully",
        data: result,
    });
});

// For vendors
const getMyVendorStats = catchAsync(async (req, res) => {
    console.log(req.user);
    const result = await VendorServices.getMyVendorStats(
        req.user.userId
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor dashboard fetched",
        data: result,
    });
});

const updateVendorStatus = catchAsync(async (req, res) => {
    const { vendorId } = req.params;
    const { status } = req.body;

    const result = await VendorServices.updateVendorStatus(
        vendorId,
        status
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor status updated",
        data: result,
    });
});

/* Suspend Vendor */
const suspendVendor = catchAsync(async (req, res) => {

    const { vendorId } = req.params;

    const result = await VendorServices.suspendVendor(
        vendorId,
        req.body
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor suspended successfully",
        data: result,
    });
});

/* Withdraw Suspension */
const withdrawVendorSuspension = catchAsync(async (req, res) => {

    const { vendorId } = req.params;

    const result = await VendorServices.withdrawVendorSuspension(
        vendorId
    );

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Vendor suspension withdrawn successfully",
        data: result,
    });
});

export const VendorControllers = {
    applyVendor,
    getPendingVendorApplications,
    getAllVendors,
    getSingleVendorById,
    getMyVendorStats,
    updateVendorStatus,
    suspendVendor,
    withdrawVendorSuspension,
};