import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import { CoinPackageServices } from "./coinPackage.service";
import sendResponse from "../../../utils/sendResponse";

// Add Coin Package
const addCoinPackage = catchAsync(async (req, res) => {
  const result = await CoinPackageServices.addCoinPackage(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Coin package added successfully",
    data: result,
  });
});

// Get All Coin Packages (Admin)
const getAllCoinPackages = catchAsync(async (req, res) => {
  const { keyword, isActive, minAmount, maxAmount, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    isActive: isActive as string,
    minAmount: minAmount as string,
    maxAmount: maxAmount as string,
  };

  const result = await CoinPackageServices.getAllCoinPackages(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coin packages fetched successfully.",
    data: {
      packages: result.data,
      meta: result.meta,
    },
  });
});

// Get Single Coin Package
const getSingleCoinPackageById = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const result = await CoinPackageServices.getSingleCoinPackageById(packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coin package fetched successfully.",
    data: result,
  });
});

// Update Coin Package
const updateCoinPackage = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const result = await CoinPackageServices.updateCoinPackage(
    packageId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coin package updated successfully",
    data: result,
  });
});

// Delete Coin Package
const deleteCoinPackage = catchAsync(async (req, res) => {
  const { packageId } = req.params;
  const result = await CoinPackageServices.deleteCoinPackage(packageId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Coin package deleted successfully.",
    data: result,
  });
});

export const CoinPackageControllers = {
  addCoinPackage,
  getAllCoinPackages,
  getSingleCoinPackageById,
  updateCoinPackage,
  deleteCoinPackage,
};