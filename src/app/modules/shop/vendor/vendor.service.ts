/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Vendor from "./vendor.model";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import Product from "../product/product.model";
import { User } from "../../auth/auth.model";
import { Types } from "mongoose";

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

    if (!files.length) {
        throw new AppError(httpStatus.BAD_REQUEST, "Please upload your NID or Business Trade License");
    }

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
        query.$text = {
            $search: filters.keyword,
        };
    }

    return infinitePaginate(Vendor, query, skip, limit, []);
};

/* Get Single Vendor */
const getSingleVendorById = async (vendorId: string,) => {

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    return vendor;
};

/* Get All Products of a Vendor */
const getAllProductsOfAVendor = async (
    vendorId: string,
    filters: any = {},
    skip = 0,
    limit = 10
) => {
    const query: any = {
        addedBy: vendorId,
    };

    if (filters.status) {
        query.status = filters.status;
    }

    if (filters.keyword) {
        query.$text = {
            $search: filters.keyword,
        };
    }

    return infinitePaginate(Product, query, skip, limit, []);
};

const getMyVendorStats = async (userId: string) => {
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    const stats = await Product.aggregate([
        {
            $match: {
                addedBy: new Types.ObjectId(userId),
            },
        },
        {
            $group: {
                _id: null,
                totalProductsCount: { $sum: 1 },
                totalClicksCount: { $sum: "$totalClicks" },
                approvedProducts: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
                    },
                },
                pendingProducts: {
                    $sum: {
                        $cond: [{ $eq: ["$status", "pending"] }, 1, 0],
                    },
                },
            },
        },
    ]);

    const totalProductsCount = stats[0]?.totalProductsCount || 0;
    const totalClicksCount = stats[0]?.totalClicksCount || 0;
    const approvedProducts = stats[0]?.approvedProducts || 0;
    const pendingProducts = stats[0]?.pendingProducts || 0;

    return {
        totalProductsCount,
        totalClicksCount,
        approvedProducts,
        pendingProducts,
    };
};

const updateVendorStatus = async (vendorId: string, status: string) => {
    const vendor = await Vendor.findByIdAndUpdate(vendorId, { status });

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    };

    if (status === "approved") {
        await User.findByIdAndUpdate(vendor.userId, { isVendor: true });
    }

    return {};
};

/* Suspend Vendor */
const suspendVendor = async (
    vendorId: string,
    payload: any
) => {

    const vendor = await Vendor.findByIdAndUpdate(vendorId, {
        $set: {
            status: "suspended",
            suspensionReason: payload?.suspensionReason,
            suspendedAt: new Date(),
        },
    });

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    };

    return vendor;
};

/* Withdraw Vendor Suspension */
const withdrawVendorSuspension = async (vendorId: string) => {

    const vendor = await Vendor.findByIdAndUpdate(
        vendorId,
        {
            $set: {
                status: "approved",
            },
            $unset: {
                suspensionReason: "",
                suspendedAt: "",
            },
        },
        { new: true }
    );

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    return vendor;
};



export const VendorServices = {
    applyVendor,
    getPendingVendorApplications,
    getAllVendors,
    getSingleVendorById,
    getAllProductsOfAVendor,
    getMyVendorStats,
    updateVendorStatus,
    suspendVendor,
    withdrawVendorSuspension,
};