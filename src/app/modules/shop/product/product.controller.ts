import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import { ProductServices } from "./product.service";

const addProduct = catchAsync(async (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];

  const result = await ProductServices.addProduct(
    req.user,
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

const getVendorProducts = catchAsync(async (req, res) => {
  const result = await ProductServices.getVendorProducts(
    req.user.userId
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Products fetched successfully",
    data: result,
  });
});

export const ProductControllers = {
  addProduct,
  deleteProduct,
  getVendorProducts,
};