import httpStatus from "http-status";
import catchAsync from "../../../utils/catchAsync";
import { ShopBannerServices } from "./shopBanner.service";
import sendResponse from "../../../utils/sendResponse";

// Add Banner
const addBanner = catchAsync(async (req, res) => {
  const file = req.file;
  const result = await ShopBannerServices.addBanner(req.body, file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Banner added successfully",
    data: result,
  });
});

// Get All Banners
const getAllBanners = catchAsync(async (req, res) => {
  const result = await ShopBannerServices.getAllBanners(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banners fetched successfully",
    data: result,
  });
});

// Delete Banner
const deleteBanner = catchAsync(async (req, res) => {
  const { bannerId } = req.params;
  const result = await ShopBannerServices.deleteBanner(bannerId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Banner deleted successfully",
    data: result,
  });
});

// Update Banner Status
const updateBannerStatus = catchAsync(async (req, res) => {
  const { bannerId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== "boolean") {
    throw new Error("isActive must be a boolean value");
  }

  const result = await ShopBannerServices.updateBannerStatus(bannerId, isActive);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Banner status updated to ${isActive ? "active" : "inactive"}`,
    data: result,
  });
});

export const ShopBannerControllers = {
  addBanner,
  getAllBanners,
  deleteBanner,
  updateBannerStatus,
};