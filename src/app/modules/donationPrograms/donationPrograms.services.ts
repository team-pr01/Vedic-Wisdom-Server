/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { TDonationPrograms } from "./donationPrograms.interface";
import DonationPrograms from "./donationPrograms.model";
import { infinitePaginate } from "../../utils/infinitePaginate";
import { deleteImageFromCloudinary, extractPublicId } from "../../utils/deleteImageFromCloudinary";

// Create donation program (admin only)
const addDonationProgram = async (
  payload: TDonationPrograms,
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
    amountNeeded: Number(payload.amountNeeded),
    imageUrl,
  };

  const result = await DonationPrograms.create(payloadData);
  return result;
};

// Get all donation programs (with optional keyword & category)
const getAllDonationPrograms = async (
  keyword?: string,
  skip = 0,
  limit = 10
) => {
  const query: any = {};

  // 🔍 Search
  if (keyword) {
    query.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
    ];
  }

  return infinitePaginate(DonationPrograms, query, skip, limit, []);
};

// Get a single donation program by ID
const getSingleDonationProgramById = async (id: string) => {
  const result = await DonationPrograms.findById(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation program not found");
  }
  return result;
};

// Update donation program by ID
const updateDonationProgram = async (
  id: string,
  payload: Partial<TDonationPrograms>,
  file: Express.Multer.File | undefined
) => {
  const existing = await DonationPrograms.findById(id);

  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation program not found");
  }

  let imageUrl: string | undefined;

  if (file) {
    const imageName = `${payload?.title || existing.title}-${Date.now()}`;
    const path = file.path;

    const { secure_url } = await sendImageToCloudinary(imageName, path);
    imageUrl = secure_url;
  }

  const updatePayload: Partial<TDonationPrograms> = {
    ...payload,
    ...(imageUrl && { imageUrl }),
  };

  const result = await DonationPrograms.findByIdAndUpdate(id, updatePayload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete donation program by ID
const deleteDonationProgram = async (id: string) => {
  const result = await DonationPrograms.findByIdAndDelete(id);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation program not found");
  }

  if (result.imageUrl) {
    const publicId = extractPublicId(result.imageUrl);
    await deleteImageFromCloudinary(publicId);
  }
  return result;
};

export const DonationProgramsService = {
  addDonationProgram,
  getAllDonationPrograms,
  getSingleDonationProgramById,
  updateDonationProgram,
  deleteDonationProgram,
};
