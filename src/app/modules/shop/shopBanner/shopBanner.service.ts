/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { ShopBanner } from "./shopBanner.model";
import { deleteImageFromCloudinary, extractPublicId } from "../../../utils/deleteImageFromCloudinary";

// Add Banner
const addBanner = async (payload: any, file: Express.Multer.File | undefined) => {
    if (!file) {
        throw new AppError(httpStatus.BAD_REQUEST, "Banner image is required");
    }

    // Upload to Cloudinary
    const imageName = `shop-banner-${Date.now()}`;
    const path = file.path;
    const { secure_url } = await sendImageToCloudinary(imageName, path);

    const payloadData = {
        ...payload,
        imageUrl: secure_url,
    };

    const result = await ShopBanner.create(payloadData);
    return result;
};

// Get All Banners (No Pagination)
const getAllBanners = async (filters: any = {}) => {
    const query: any = { isActive: true };

    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === "true" || filters.isActive === true;
    }

    const result = await ShopBanner.find(query).sort({ createdAt: -1 });
    return result;
};

// Delete Banner
const deleteBanner = async (bannerId: string) => {
    const existing = await ShopBanner.findById(bannerId);
    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
    }

    // Delete image from Cloudinary
    if (existing.imageUrl) {
        const publicId = extractPublicId(existing.imageUrl);
        await deleteImageFromCloudinary(publicId);
    }

    return await ShopBanner.findByIdAndDelete(bannerId);
};

// Update Banner Status (Toggle)
const updateBannerStatus = async (bannerId: string, isActive: boolean) => {
    const existing = await ShopBanner.findById(bannerId);
    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
    }

    const result = await ShopBanner.findByIdAndUpdate(
        bannerId,
        { isActive },
        { new: true, runValidators: true }
    );

    return result;
};

export const ShopBannerServices = {
    addBanner,
    getAllBanners,
    deleteBanner,
    updateBannerStatus,
};