/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import Ayurveda from "./ayurveda.model";
import { infinitePaginate } from "../../utils/infinitePaginate";

// Add
const addAyurveda = async (payload: any) => {
  const result = await Ayurveda.create(payload);
  return result;
};

// Get All
const getAllAyurveda = async (filters: any = {}, skip = 0, limit = 10) => {
  const query: any = {};

  if (filters.keyword) {
    query.$text = { $search: filters.keyword };
  }

  if (filters.category) {
    query.category = filters.category.trim().toLowerCase();
  }

  return infinitePaginate(Ayurveda, query, skip, limit, []);
};

// Get Single
const getSingleAyurvedaById = async (ayurvedaId: string) => {
  const result = await Ayurveda.findById(ayurvedaId);
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "Ayurveda not found");
  }
  return result;
};

// Update
const updateAyurveda = async (ayurvedaId: string, payload: any) => {
  const existing = await Ayurveda.findById(ayurvedaId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Ayurveda not found");
  }

  const result = await Ayurveda.findByIdAndUpdate(ayurvedaId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

// Delete
const deleteAyurveda = async (ayurvedaId: string) => {
  const existing = await Ayurveda.findById(ayurvedaId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Ayurveda not found");
  }

  return await Ayurveda.findByIdAndDelete(ayurvedaId);
};

export const AyurvedaServices = {
  addAyurveda,
  getAllAyurveda,
  getSingleAyurvedaById,
  updateAyurveda,
  deleteAyurveda,
};