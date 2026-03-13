/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Product from "./product.model";
import Vendor from "../vendor/vendor.model";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";

const addProduct = async (
    user: any,
    payload: any,
    files: Express.Multer.File[]
) => {
    const vendor = await Vendor.findOne({
        userId: user.userId,
        status: "approved",
    });

    if (!vendor) {
        throw new AppError(httpStatus.FORBIDDEN, "Vendor not approved");
    }

    let imageUrls: string[] = [];

    if (files.length) {
        const uploads = files.map(async (file, index) => {
            const { secure_url } = await sendImageToCloudinary(
                `product-${Date.now()}-${index}`,
                file.path
            );

            return secure_url;
        });

        imageUrls = await Promise.all(uploads);
    }

    const product = await Product.create({
        ...payload,
        imageUrls,
    });

    await Vendor.findByIdAndUpdate(vendor._id, {
        $inc: { totalProducts: 1 },
    });

    return product;
};

const deleteProduct = async (productId: string, user: any) => {
    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    const vendor = await Vendor.findOne({ userId: user.userId });

    if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
        throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
    }

    await Product.findByIdAndDelete(productId);

    await Vendor.findByIdAndUpdate(vendor._id, {
        $inc: { totalProducts: -1 },
    });

    return true;
};

const getVendorProducts = async (
    vendorId: string,
    skip = 0,
    limit = 10
) => {

    const vendor = await Vendor.findById(vendorId);

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    const query = {
        vendorId,
    };

    return infinitePaginate(Product, query, skip, limit);
};

export const ProductServices = {
    addProduct,
    deleteProduct,
    getVendorProducts,
};