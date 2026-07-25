/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import { CoinPackage } from "./coinPackage.model";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import AppError from "../../../errors/AppError";

// Add Coin Package
const addCoinPackage = async (payload: any) => {
    const result = await CoinPackage.create(payload);
    return result;
};

// Get All Coin Packages
const getAllCoinPackages = async (filters: any = {}, skip = 0, limit = 10) => {
    const query: any = {};

    // Text search
    if (filters.keyword) {
        query.$text = { $search: filters.keyword };
    }

    // Filter by active status
    if (filters.isActive !== undefined) {
        query.isActive = filters.isActive === "true";
    }

    // Filter by min amount
    if (filters.minAmount) {
        query.amount = { $gte: Number(filters.minAmount) };
    }

    // Filter by max amount
    if (filters.maxAmount) {
        query.amount = { ...query.amount, $lte: Number(filters.maxAmount) };
    }

    return infinitePaginate(CoinPackage, query, skip, limit, []);
};

// Get Single Coin Package
const getSingleCoinPackageById = async (packageId: string) => {
    const result = await CoinPackage.findById(packageId);
    if (!result) {
        throw new AppError(httpStatus.NOT_FOUND, "Coin package not found");
    }
    return result;
};

// Update Coin Package
const updateCoinPackage = async (packageId: string, payload: any) => {
    const existing = await CoinPackage.findById(packageId);
    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Coin package not found");
    }

    const result = await CoinPackage.findByIdAndUpdate(packageId, payload, {
        new: true,
        runValidators: true,
    });

    return result;
};

// Delete Coin Package
const deleteCoinPackage = async (packageId: string) => {
    const existing = await CoinPackage.findById(packageId);
    if (!existing) {
        throw new AppError(httpStatus.NOT_FOUND, "Coin package not found");
    }

    return await CoinPackage.findByIdAndDelete(packageId);
};

export const CoinPackageServices = {
    addCoinPackage,
    getAllCoinPackages,
    getSingleCoinPackageById,
    updateCoinPackage,
    deleteCoinPackage,
};