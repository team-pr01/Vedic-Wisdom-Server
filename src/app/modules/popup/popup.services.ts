/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Popup from "./popup.model";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";

// Create Popup
const createPopup = async (
  payload: any,
  file: Express.Multer.File | undefined
) => {
  let imageUrl = "";

  if (file) {
    const imageName = `${payload.title}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const payloadData = {
    ...payload,
    imageUrl,
    targetPages: payload.targetPages ? JSON.parse(payload.targetPages) : [],
  };
  const result = await Popup.create(payloadData);
  return result;
};

// Get All Popups (with optional title search)
const getAllPopups = async (keyword: any) => {
  const filter: any = {};

  if (keyword) {
    filter.title = { $regex: keyword, $options: "i" };
  }

  const result = await Popup.find(filter);
  return result;
};

// Get Single Popup by ID
const getPopupById = async (popupId: string) => {
  const result = await Popup.findById(popupId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Popup not found");
  }
  return result;
};

// Update Popup
const updatePopup = async (
  popupId: string,
  payload: any,
  file: any
) => {
  const existing = await Popup.findById(popupId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Popup not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `${payload?.title || existing.title}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  // Parse targetPages if it exists
  const parsedPayload = { ...payload };

  if (payload.targetPages) {
    try {
      parsedPayload.targetPages = typeof payload.targetPages === 'string'
        ? JSON.parse(payload.targetPages)
        : payload.targetPages;
    } catch (error) {
      parsedPayload.targetPages = [];
    }
  }

  if (imageUrl) {
    parsedPayload.imageUrl = imageUrl;
  }

  const result = await Popup.findByIdAndUpdate(popupId, parsedPayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete Popup
const deletePopup = async (popupId: string) => {
  const existing = await Popup.findById(popupId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Popup not found");
  }

  await Popup.findByIdAndDelete(popupId);

  return null;
};

export const PopupServices = {
  createPopup,
  getAllPopups,
  getPopupById,
  updatePopup,
  deletePopup,
};
