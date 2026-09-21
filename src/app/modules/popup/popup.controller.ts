import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PopupServices } from "./popup.services";

// Create Popup
const createPopup = catchAsync(async (req, res) => {
  const popupData = req.body;
  const file = req.file;
  const result = await PopupServices.createPopup(popupData, file);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Popup created successfully",
    data: result,
  });
});

// Get All Popups (optionally filtered)
const getAllPopups = catchAsync(async (req, res) => {
  const { keyword } = req.query as { keyword?: string };
  const result = await PopupServices.getAllPopups(keyword);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popups fetched successfully",
    data: result,
  });
});

// Get Single Popup by ID
const getPopupById = catchAsync(async (req, res) => {
  const popupId = req.params.popupId;
  const result = await PopupServices.getPopupById(popupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popup fetched successfully",
    data: result,
  });
});

// Update Popup by ID
const updatePopup = catchAsync(async (req, res) => {
  const popupId = req.params.popupId;
  const updatedData = req.body;
  const file = req.file;
  const result = await PopupServices.updatePopup(popupId, updatedData, file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popup updated successfully",
    data: result,
  });
});

// Delete Popup by ID
const deletePopup = catchAsync(async (req, res) => {
  const popupId = req.params.popupId;
  const result = await PopupServices.deletePopup(popupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Popup deleted successfully",
    data: result,
  });
});

export const PopupControllers = {
  createPopup,
  getAllPopups,
  getPopupById,
  updatePopup,
  deletePopup,
};
