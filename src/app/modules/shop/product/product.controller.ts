import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ProductServices } from "./product.service";

const addProduct = catchAsync(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];

  const result = await ProductServices.addProduct(
    req.user.userId,
    req.body,
    files
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product added successfully",
    data: result,
  });
});

/* Get All Products */
const getAllProducts = catchAsync(async (req, res) => {

  const { keyword, category, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    category: category as string,
  };

  const result = await ProductServices.getAllProducts(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products fetched successfully",
    data: result,
  });
});


/* Get Single Product */
const getSingleProductById = catchAsync(async (req, res) => {

  const { productId } = req.params;

  const result = await ProductServices.getSingleProductById(productId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product fetched successfully",
    data: result,
  });
});

// For vendor
const getMyProducts = catchAsync(async (req, res) => {

  const { skip = "0", limit = "10" } = req.query;

  const result = await ProductServices.getMyProducts(
    req.user.userId,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "My products fetched successfully",
    data: result,
  });
});

// For admin
const getVendorProducts = catchAsync(async (req, res) => {

  const { userId } = req.params;
  const { skip = "0", limit = "10" } = req.query;

  const result = await ProductServices.getVendorProducts(
    userId,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Vendor products fetched successfully",
    data: result,
  });
});

/* Update Product */
const updateProduct = catchAsync(async (req, res) => {

  const { productId } = req.params;

  const files = (req.files as Express.Multer.File[]) || [];

  const result = await ProductServices.updateProduct(
    productId,
    req.user,
    req.body,
    files
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product updated successfully",
    data: result,
  });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { productId } = req.params;

  const result = await ProductServices.deleteProduct(
    productId,
    req.user
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Product deleted successfully",
    data: result,
  });
});



export const ProductControllers = {
  addProduct,
  getAllProducts,
  getSingleProductById,
  getMyProducts,
  getVendorProducts,
  updateProduct,
  deleteProduct,
};