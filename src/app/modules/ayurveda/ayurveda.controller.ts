import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AyurvedaServices } from "./ayurveda.services";

// Add
const addAyurveda = catchAsync(async (req, res) => {
  const result = await AyurvedaServices.addAyurveda(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ayurveda added successfully",
    data: result,
  });
});

// Get All
const getAllAyurveda = catchAsync(async (req, res) => {
  const { keyword, category, skip = "0", limit = "10" } = req.query;

  const filters = {
    keyword: keyword as string,
    category: category as string,
  };

  const result = await AyurvedaServices.getAllAyurveda(
    filters,
    Number(skip),
    Number(limit)
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ayurveda fetched successfully.",
    data: {
      ayurveda: result.data,
      meta: result.meta,
    },
  });
});

// Get Single
const getSingleAyurvedaById = catchAsync(async (req, res) => {
  const { ayurvedaId } = req.params;
  const result = await AyurvedaServices.getSingleAyurvedaById(ayurvedaId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ayurveda fetched successfully.",
    data: result,
  });
});

// Update
const updateAyurveda = catchAsync(async (req, res) => {
  const { ayurvedaId } = req.params;

  const result = await AyurvedaServices.updateAyurveda(
    ayurvedaId,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Ayurveda updated successfully",
    data: result,
  });
});

// Delete
const deleteAyurveda = catchAsync(async (req, res) => {
  const { ayurvedaId } = req.params;
  const result = await AyurvedaServices.deleteAyurveda(ayurvedaId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Ayurveda deleted successfully.",
    data: result,
  });
});

export const AyurvedaControllers = {
  addAyurveda,
  getAllAyurveda,
  getSingleAyurvedaById,
  updateAyurveda,
  deleteAyurveda,
};