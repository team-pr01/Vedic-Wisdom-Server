/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Vendor from "./vendor.model";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";

const applyVendor = async (
    user: any,
    payload: any,
    files: Express.Multer.File[]
) => {
    const exists = await Vendor.findOne({ userId: user.userId });

    if (exists) {
        throw new AppError(httpStatus.BAD_REQUEST, "Already applied");
    }

    let documentUrls: string[] = [];

    if (files.length) {
        const uploads = files.map(async (file, index) => {
            const { secure_url } = await sendImageToCloudinary(
                `vendor-doc-${Date.now()}-${index}`,
                file.path
            );

            return secure_url;
        });

        documentUrls = await Promise.all(uploads);
    }

    const vendorData = {
        ...payload,
        userId: user.userId,
        documentUrls,
        status: "applied",
    };

    return Vendor.create(vendorData);
};

/* Get Pending Vendor Applications */
const getPendingVendorApplications = async (
    skip = 0,
    limit = 10
) => {

    const query = {
        status: "applied",
    };

    return infinitePaginate(Vendor, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
};


/* Get All Vendors */
const getAllVendors = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {

    const query: any = {};

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.keyword) {
        query.shopName = {
            $regex: filters.keyword,
            $options: "i",
        };
    }

    return infinitePaginate(Vendor, query, skip, limit, [
        { path: "userId", select: "name email phoneNumber" },
    ]);
};


/* Get Single Vendor */
const getSingleVendorById = async (vendorId: string) => {

    const vendor = await Vendor.findById(vendorId)
        .populate("userId", "name email phoneNumber");

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    return vendor;
};

// For vendors
const getMyVendorStats = async (userId: string) => {
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    return vendor;
};

/* Suspend Vendor */
const suspendVendor = async (
    vendorId: string,
    reason: string
) => {

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    vendor.status = "suspended";
    vendor.suspensionReason = reason;
    vendor.suspendedAt = new Date();

    await vendor.save();

    return vendor;
};

const updateVendorStatus = async (vendorId: string, status: string) => {
    const vendor = await Vendor.findByIdAndUpdate(vendorId, { status });

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    };

    return vendor;
};



export const VendorServices = {
    applyVendor,
    getPendingVendorApplications,
    getAllVendors,
    getSingleVendorById,
    getMyVendorStats,
    suspendVendor,
    updateVendorStatus,
};