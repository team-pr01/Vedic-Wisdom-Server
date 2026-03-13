/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import Product from "./product.model";
import Vendor from "../vendor/vendor.model";
import AppError from "../../../errors/AppError";
import { sendImageToCloudinary } from "../../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../../utils/infinitePaginate";
import { User } from "../../auth/auth.model";
import { deleteImageFromCloudinary } from "../../../utils/deleteImageFromCloudinary";

const addProduct = async (
    userId: any,
    payload: any,
    files: Express.Multer.File[]
) => {
    const user = await User.findById(userId).lean();

    // Checking if vendor is approved or not
    if (user?.role === "user") {
        const vendor = await Vendor.findOne({
            userId,
            status: "approved",
        });

        if (!vendor) {
            throw new AppError(httpStatus.FORBIDDEN, "Vendor not approved");
        }
    };

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
        addedBy: userId,
    });

    return product;
};

/* Get All Products */
const getAllProducts = async (
    filters: any = {},
    skip = 0,
    limit = 10
) => {

    const query: any = {};

    if (filters.category) {
        query.category = filters.category;
    }

    if (filters.keyword) {
        query.$text = {
            $search: filters.keyword,
        };
    }

    return infinitePaginate(Product, query, skip, limit, []);
};

/* Get Single Product */
const getSingleProductById = async (productId: string) => {

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    return product;
};

// For Vendor
const getMyProducts = async (
    userId: string,
    skip = 0,
    limit = 10
) => {

    const vendor = await Vendor.findOne({
        userId,
        status: "approved",
    }).lean();

    if (!vendor) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            "Vendor not approved or not found"
        );
    }

    const query = {
        addedBy: userId,
    };

    return infinitePaginate(Product, query, skip, limit);
};

// For admin
const getVendorProducts = async (
    userId: string,
    skip = 0,
    limit = 10
) => {

    const vendor = await Vendor.findOne({ userId }).lean();

    if (!vendor) {
        throw new AppError(httpStatus.NOT_FOUND, "Vendor not found");
    }

    const query = {
        addedBy: vendor.userId,
    };

    return infinitePaginate(Product, query, skip, limit);
};

/* Update Product */
const updateProduct = async (
    productId: string,
    userId: any,
    payload: any,
    files: Express.Multer.File[]
) => {

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    const user = await User.findById(userId).lean();

    // Checking if vendor is approved or not
    if (user?.role === "user") {
        const vendor = await Vendor.findOne({
            userId,
            status: "approved",
        });

        if (!vendor) {
            throw new AppError(httpStatus.FORBIDDEN, "Vendor not approved");
        }

        if (vendor.userId.toString() !== product.addedBy.toString()) {
            throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
        }
    };

    let imageUrls = product.imageUrls || [];

    if (files?.length) {

        const uploads = files.map(async (file, index) => {

            const { secure_url } = await sendImageToCloudinary(
                `product-${Date.now()}-${index}`,
                file.path
            );

            return secure_url;
        });

        const uploadedImages = await Promise.all(uploads);

        imageUrls = [...imageUrls, ...uploadedImages];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            ...payload,
            imageUrls,
        },
        { new: true }
    );

    return updatedProduct;
};

const deleteProduct = async (productId: string, userId: string) => {

    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError(httpStatus.NOT_FOUND, "Product not found");
    }

    if (userId.toString() !== product.addedBy.toString()) {
        throw new AppError(httpStatus.FORBIDDEN, "Not allowed");
    }

    /* Delete images from cloudinary */
    if (product.imageUrls?.length) {

        await Promise.all(
            product.imageUrls.map(async (url: string) => {

                const publicId = url.split("/").pop()?.split(".")[0];

                if (publicId) {
                    await deleteImageFromCloudinary(publicId);
                }

            })
        );

    }

    await Product.findByIdAndDelete(productId);

    return true;
};


export const ProductServices = {
    addProduct,
    getAllProducts,
    getSingleProductById,
    getMyProducts,
    getVendorProducts,
    updateProduct,
    deleteProduct,
};