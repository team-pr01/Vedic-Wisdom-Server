/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { TConsultancyService } from "./consultants.interface";
import ConsultancyService from "./consultants.model";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";

// Add consultant (admin only)
const addConsultant = async (
  payload: any,
  file: Express.Multer.File | undefined
) => {
  let imageUrl = "";

  if (file) {
    const imageName = `${payload.name}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const payloadData = {
    ...payload,
    imageUrl,
    specialties: payload.specialties ? JSON.parse(payload.specialties) : [],
  };

  const result = await ConsultancyService.create(payloadData);
  return result;
};

// Get all consultant
const getAllConsultants = async (
  keyword?: string,
  category?: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: "i" } },
      { specialty: { $regex: keyword, $options: "i" } },
    ];
  }


  if (category) {
    query.category = { $regex: `^${category}$`, $options: "i" };
  }


  return infinitePaginate(ConsultancyService, query, skip, limit, []);
};

// Get single consultant by ID
const getSingleConsultantsById = async (id: string) => {
  const result = await ConsultancyService.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultant not found");
  }
  return result;
};

// Update consultant
const updateConsultant = async (
  id: string,
  payload: Partial<TConsultancyService>,
  file: any
) => {
  const existing = await ConsultancyService.findById(id);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultant not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `${payload?.name || existing.name}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const updatePayload: Partial<TConsultancyService> = {
    ...payload,
    ...(imageUrl && { imageUrl }),
  };

  const result = await ConsultancyService.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete consultant by ID
const deleteConsultant = async (id: string) => {
  const result = await ConsultancyService.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Consultant not found");
  }

  if (result.imageUrl) {
    const publicId = extractPublicId(result.imageUrl);
    await deleteImageFromCloudinary(publicId);
  }
  return result;
};

export const ConsultancyServiceServices = {
  addConsultant,
  getAllConsultants,
  getSingleConsultantsById,
  updateConsultant,
  deleteConsultant,
};